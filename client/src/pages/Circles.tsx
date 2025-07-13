import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { formatNameWithInitials, getNameInitials, formatUserDisplayName } from "@/lib/nameUtils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Users, 
  Settings, 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle,
  UserPlus,
  MoreVertical,
  Search,
  MessageSquare,
  Activity,
  Calendar,
  Send,
  MapPin,
  User,
  Check,
  X,
  Trash,
  Smile,
  Mail,
  ChevronLeft
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

interface Circle {
  id: number;
  name: string;
  description?: string;
  category: string;
  isPrivate: boolean;
  showMembers?: boolean;
  creatorId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CircleInvitation {
  id: number;
  circleId: number;
  inviterId: string;
  inviteeId: string;
  status: string;
  message?: string;
  createdAt: string;
  respondedAt?: string;
  circle: {
    id: number;
    name: string;
    description?: string;
    category: string;
    isPrivate: boolean;
  };
  inviter: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface CircleMembership {
  id: number;
  circleId: number;
  userId: string;
  role: string;
  createdAt: string;
  joinedAt: string;
  circle: {
    id: number;
    name: string;
    description?: string;
    category: string;
    isPrivate: boolean;
    memberCount: number;
  };
}

interface CircleMessage {
  id: number;
  circleId: number;
  senderId: string;
  message: string;
  messageType: string;
  attachments?: string[];
  isAnnouncement: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface CircleActivity {
  id: number;
  circleId: number;
  userId: string;
  activityType: string;
  description: string;
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface CircleEvent {
  id: number;
  circleId: number;
  creatorId: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  maxAttendees?: number;
  isVirtual: boolean;
  meetingLink?: string;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface CircleEventAttendee {
  id: number;
  eventId: number;
  userId: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export default function Circles() {
  const [activeTab, setActiveTab] = useState("my-circles");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    isPrivate: false
  });
  
  // Enhanced state for circle interactions
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [activeInteractionTab, setActiveInteractionTab] = useState("messages");
  const [newMessage, setNewMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    maxAttendees: "",
    isVirtual: false,
    meetingLink: ""
  });
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [settingsCircle, setSettingsCircle] = useState<Circle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [circleToDelete, setCircleToDelete] = useState<Circle | null>(null);
  const [directMessageState, setDirectMessageState] = useState<{
    open: boolean;
    member: any;
    message: string;
    conversation: any[];
    isLoadingConversation: boolean;
  }>({ open: false, member: null, message: '', conversation: [], isLoadingConversation: false });
  
  const [isDMEmojiPickerOpen, setIsDMEmojiPickerOpen] = useState(false);

  // Force re-render when dialog state changes
  const [dialogKey, setDialogKey] = useState(0);
  
  // Debug effect to track state changes
  useEffect(() => {
    console.log('directMessageState changed:', directMessageState);
  }, [directMessageState]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Force clear all circle cache and refresh data
  const clearCircleCache = () => {
    queryClient.clear(); // Clear all cache
    queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
    queryClient.invalidateQueries({ queryKey: ['/api/my-circles'] });
    queryClient.invalidateQueries({ queryKey: ['/api/circle-invitations'] });
    if (selectedCircleId) {
      queryClient.invalidateQueries({ queryKey: ['/api/circles', selectedCircleId] });
    }
  };
  const { user } = useAuth();

  // Emoji categories for the picker
  const emojis = {
    smileys: ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤔", "🤐", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "🥴", "😠", "😡", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥺", "🤠", "🤡", "🤥", "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "🤖", "💩"],
    hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    gestures: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    activities: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤸", "🤺", "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏃", "🚶", "🧎", "🧍", "🤹"],
    food: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯"],
    nature: ["🌱", "🌿", "🍀", "🌾", "🌵", "🌴", "🌲", "🌳", "🌺", "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌎", "🌍", "🌏", "🪐", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️", "⛅", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊", "🌫️"]
  };

  // Fetch user's created circles
  const { data: myCircles = [], isLoading: isLoadingMyCircles } = useQuery({
    queryKey: ['/api/circles'],
  });

  // Fetch user's circle memberships
  const { data: joinedCircles = [], isLoading: isLoadingJoinedCircles } = useQuery({
    queryKey: ['/api/my-circles'],
  });

  // Fetch circle invitations
  const { data: invitations = [], isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['/api/circle-invitations'],
  });

  // Enhanced queries for circle interactions
  const { data: circleMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: [`/api/circles/${selectedCircleId}/messages`],
    queryFn: async () => {
      if (!selectedCircleId) return [];
      const response = await fetch(`/api/circles/${selectedCircleId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedCircleId && activeInteractionTab === 'messages',
    staleTime: 0, // Always refetch when data might be stale
    cacheTime: 0, // Don't cache at all
  });

  const { data: circleActivities = [] } = useQuery({
    queryKey: [`/api/circles/${selectedCircleId}/activities`],
    queryFn: async () => {
      if (!selectedCircleId) return [];
      const response = await fetch(`/api/circles/${selectedCircleId}/activities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    enabled: !!selectedCircleId && activeInteractionTab === 'activities',
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: circleEvents = [] } = useQuery({
    queryKey: [`/api/circles/${selectedCircleId}/events`],
    queryFn: async () => {
      if (!selectedCircleId) return [];
      const response = await fetch(`/api/circles/${selectedCircleId}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!selectedCircleId && activeInteractionTab === 'events',
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: circleMembers = [], isLoading: membersLoading, error: membersError } = useQuery({
    queryKey: [`/api/circles/${selectedCircleId}/members`],
    queryFn: async () => {
      if (!selectedCircleId) return [];
      const response = await fetch(`/api/circles/${selectedCircleId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    },
    enabled: !!selectedCircleId,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Debug logging
  console.log('Circle Members Debug:', {
    selectedCircleId,
    membersLoading,
    membersError,
    membersCount: circleMembers?.length,
    members: circleMembers,
    rawMembersData: JSON.stringify(circleMembers, null, 2),
    queryKey: [`/api/circles/${selectedCircleId}/members`],
    authToken: localStorage.getItem('authToken')?.substring(0, 20) + '...',
    currentUserId: user?.id,
    firstMemberUserId: circleMembers?.[0]?.userId,
    userIdMatch: circleMembers?.[0]?.userId === user?.id
  });

  // Create circle mutation
  const createCircleMutation = useMutation({
    mutationFn: async (circleData: any) => {
      console.log('Making API request with data:', circleData);
      const response = await apiRequest('/api/circles', {
        method: 'POST',
        body: JSON.stringify(circleData)
      });
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Circle created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Circle Created",
        description: "Your new circle has been created successfully!",
      });
    },
    onError: (error) => {
      console.error('Circle creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to create circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update circle mutation
  const updateCircleMutation = useMutation({
    mutationFn: async ({ circleId, updates }: { circleId: number; updates: any }) => {
      const response = await apiRequest(`/api/circles/${circleId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      return await response.json();
    },
    onSuccess: (updatedCircle, { updates }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
      
      // Update the settingsCircle state with the new values
      if (settingsCircle) {
        setSettingsCircle(prev => ({ ...prev, ...updates }));
      }
      
      toast({
        title: "Settings Updated",
        description: "Circle settings have been updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Circle update failed:', error);
      toast({
        title: "Error",
        description: "Failed to update circle settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete circle mutation
  const deleteCircleMutation = useMutation({
    mutationFn: async (circleId: number) => {
      const response = await apiRequest(`/api/circles/${circleId}`, {
        method: 'DELETE'
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
      toast({
        title: "Circle Deleted",
        description: "Your circle has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Circle deletion failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Respond to invitation mutation
  const respondToInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, status }: { invitationId: number; status: string }) => {
      const response = await apiRequest(`/api/circle-invitations/${invitationId}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/circle-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-circles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Response Sent",
        description: "Your response has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to respond to invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async ({ circleId, inviteeId, message }: { circleId: number; inviteeId: string; message: string }) => {
      const response = await apiRequest(`/api/circles/${circleId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ inviteeId, message })
      });
      return await response.json();
    },
    onSuccess: () => {
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteMessage("");
      toast({
        title: "Invitation Sent",
        description: "Circle invitation has been sent successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced mutations for circle interactions
  const sendMessageMutation = useMutation({
    mutationFn: async ({ circleId, message }: { circleId: number; message: string }) => {
      const response = await apiRequest(`/api/circles/${circleId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      // Invalidate and refetch messages using the query key
      queryClient.invalidateQueries({ queryKey: [`/api/circles/${selectedCircleId}/messages`] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the circle.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Debug messages (after mutations are defined)
  console.log('Circle Messages Debug:', {
    selectedCircleId,
    activeInteractionTab,
    messagesCount: circleMessages?.length,
    messages: circleMessages,
    newMessage: newMessage,
    sendingMessage: sendMessageMutation.isPending
  });

  // Direct message mutation
  const sendDirectMessageMutation = useMutation({
    mutationFn: async ({ recipientId, message }: { recipientId: string; message: string }) => {
      const response = await apiRequest('/api/direct-messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId, message })
      });
      return response.json();
    },
    onSuccess: () => {
      const memberName = directMessageState.member?.user?.firstName || 'the member';
      setDirectMessageState({ open: false, member: null, message: '', conversation: [], isLoadingConversation: false });
      setIsDMEmojiPickerOpen(false);
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${memberName}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async ({ circleId, eventData }: { circleId: number; eventData: any }) => {
      const response = await apiRequest(`/api/circles/${circleId}/events`, {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
      return response.json();
    },
    onSuccess: () => {
      setIsEventDialogOpen(false);
      setEventFormData({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        maxAttendees: "",
        isVirtual: false,
        meetingLink: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/circles', selectedCircleId, 'events'] });
      toast({
        title: "Event Created",
        description: "Your circle event has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async ({ circleId, userId }: { circleId: number; userId: string }) => {
      const response = await apiRequest(`/api/circles/${circleId}/members/${userId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/circles/${selectedCircleId}/members`] });
      queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-circles'] });
      toast({
        title: "Member Removed",
        description: "The member has been removed from the circle.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Leave circle mutation
  const leaveCircleMutation = useMutation({
    mutationFn: async ({ circleId, userId }: { circleId: number; userId: string }) => {
      const response = await apiRequest(`/api/circles/${circleId}/members/${userId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/circles/${selectedCircleId}/members`] });
      queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-circles'] });
      // Reset selected circle since user left
      setSelectedCircleId(null);
      setActiveTab('my-circles');
      toast({
        title: "Left Circle",
        description: "You have successfully left the circle.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to leave circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCircle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Circle name is required.",
        variant: "destructive",
      });
      return;
    }

    const circleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      isPrivate: formData.isPrivate
    };

    console.log('Submitting circle data:', circleData);
    createCircleMutation.mutate(circleData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
      isPrivate: false
    });
  };

  const handleSendInvitation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCircle) return;

    // For demo purposes, we'll use email as user ID
    // In a real app, you'd look up user by email first
    sendInvitationMutation.mutate({
      circleId: selectedCircle.id,
      inviteeId: inviteEmail,
      message: inviteMessage || `You've been invited to join "${selectedCircle.name}"`
    });
  };

  const handleRespondToInvitation = (invitationId: number, status: string) => {
    respondToInvitationMutation.mutate({ invitationId, status });
  };

  // Enhanced handlers for circle interactions
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCircleId || !newMessage.trim()) return;

    sendMessageMutation.mutate({
      circleId: selectedCircleId,
      message: newMessage.trim()
    });
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Handle emoji selection for direct messages
  const handleDMEmojiSelect = (emoji: string) => {
    setDirectMessageState(prev => ({
      ...prev,
      message: prev.message + emoji
    }));
    setIsDMEmojiPickerOpen(false);
  };

  // Handle direct message to member - open dialog and load conversation
  const handleMessageMember = async (member: any) => {
    console.log('Opening DM dialog for:', member?.user?.firstName);
    
    // Set initial state with loading
    setDirectMessageState({
      open: true,
      member: member,
      message: '',
      conversation: [],
      isLoadingConversation: true
    });
    setDialogKey(prev => prev + 1);
    
    // Load conversation history
    try {
      const response = await fetch(`/api/direct-messages/${member.user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      
      if (response.ok) {
        const messages = await response.json();
        console.log('Loaded conversation:', messages);
        setDirectMessageState(prev => ({
          ...prev,
          conversation: messages,
          isLoadingConversation: false
        }));
      } else {
        console.error('Failed to load conversation');
        setDirectMessageState(prev => ({
          ...prev,
          conversation: [],
          isLoadingConversation: false
        }));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setDirectMessageState(prev => ({
        ...prev,
        conversation: [],
        isLoadingConversation: false
      }));
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!directMessageState.message.trim() || !directMessageState.member) return;

    try {
      const response = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          recipientId: directMessageState.member.user.id,
          message: directMessageState.message.trim()
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        
        // Add new message to conversation and clear input
        setDirectMessageState(prev => ({
          ...prev,
          message: '',
          conversation: [...prev.conversation, newMessage]
        }));
        
        toast({ 
          title: "Message sent!", 
          description: `Your message to ${directMessageState.member.user.firstName} has been sent.`
        });
      } else {
        toast({ 
          title: "Error", 
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending direct message:', error);
      toast({ 
        title: "Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCircleId || !eventFormData.title.trim() || !eventFormData.eventDate) return;

    const eventData = {
      title: eventFormData.title.trim(),
      description: eventFormData.description.trim(),
      eventDate: eventFormData.eventDate,
      location: eventFormData.location.trim(),
      maxAttendees: eventFormData.maxAttendees ? parseInt(eventFormData.maxAttendees) : undefined,
      isVirtual: eventFormData.isVirtual,
      meetingLink: eventFormData.meetingLink.trim()
    };

    createEventMutation.mutate({ circleId: selectedCircleId, eventData });
  };

  // Handle removing a member from the circle (for circle owners)
  const handleRemoveMember = (member: any) => {
    if (!selectedCircleId || !member) return;
    
    const memberName = member.user?.firstName || 'this member';
    const confirmed = window.confirm(`Are you sure you want to remove ${memberName} from this circle? This action cannot be undone.`);
    
    if (confirmed) {
      removeMemberMutation.mutate({ 
        circleId: selectedCircleId, 
        userId: member.userId 
      });
    }
  };

  // Handle leaving the circle (for regular members)
  const handleLeaveCircle = () => {
    if (!selectedCircleId || !user?.id) return;
    
    const circleName = selectedCircleData?.name || 'this circle';
    const confirmed = window.confirm(`Are you sure you want to leave "${circleName}"? You'll need to be re-invited to join again.`);
    
    if (confirmed) {
      leaveCircleMutation.mutate({ 
        circleId: selectedCircleId, 
        userId: user.id 
      });
    }
  };

  const handleOpenCircle = (circle: Circle | CircleMembership) => {
    const circleId = 'circleId' in circle ? circle.circleId : circle.id;
    setSelectedCircleId(circleId);
    setActiveInteractionTab("messages");
    
    // Clear ALL cache to ensure fresh data
    queryClient.clear();
    queryClient.invalidateQueries({ queryKey: ['/api/circles'] });
    queryClient.invalidateQueries({ queryKey: ['/api/circles', circleId] });
  };

  const handleOpenSettings = (circle: Circle) => {
    setSettingsCircle(circle);
    setIsSettingsDialogOpen(true);
  };

  const handleUpdatePrivacy = (isPrivate: boolean) => {
    if (!settingsCircle) return;
    
    updateCircleMutation.mutate({
      circleId: settingsCircle.id,
      updates: { isPrivate }
    });
  };

  const handleUpdateMemberVisibility = (showMembers: boolean) => {
    if (!settingsCircle) return;
    
    updateCircleMutation.mutate({
      circleId: settingsCircle.id,
      updates: { showMembers }
    });
  };

  const handleOpenDeleteDialog = (circle: Circle) => {
    setCircleToDelete(circle);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!circleToDelete) return;
    
    deleteCircleMutation.mutate(circleToDelete.id);
    setIsDeleteDialogOpen(false);
    setCircleToDelete(null);
  };

  const pendingInvitations = invitations.filter((inv: CircleInvitation) => inv.status === 'pending');

  // If a circle is selected, show the interaction interface
  if (selectedCircleId) {
    const selectedCircleData = [...myCircles, ...joinedCircles.map(m => m.circle)].find(c => 
      c.id === selectedCircleId
    );

    // Safety check to ensure we have circle data
    if (!selectedCircleData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 mobile-nav-padding">
          <div className="container mx-auto px-4 py-6">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Circle not found. Please return to the circles list.</p>
                <Button 
                  onClick={() => setSelectedCircleId(null)}
                  className="mt-4"
                >
                  Back to Circles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 mobile-nav-padding">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header Section */}
          <div className="relative mb-8">
            {/* Gradient Background Card */}
            <Card className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedCircleId(null)}
                      className="text-white hover:bg-white/20 rounded-full p-2"
                      size="sm"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{selectedCircleData?.name}</h1>
                        <p className="text-white/90 text-lg mb-3">{selectedCircleData?.description || "Welcome to this circle"}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            <Users className="w-3 h-3 mr-1" />
                            {(selectedCircleData?.memberCount || 0)} members
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {selectedCircleData?.category}
                          </Badge>
                          {selectedCircleData?.isPrivate && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Enhanced Interaction Tabs */}
          <Tabs value={activeInteractionTab} onValueChange={setActiveInteractionTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white shadow-lg rounded-full p-1 border">
                <TabsTrigger 
                  value="messages" 
                  className="flex items-center space-x-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="flex items-center space-x-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activities" 
                  className="flex items-center space-x-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Activities</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex items-center space-x-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enhanced Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">Circle Messages</CardTitle>
                      <p className="text-white/80 text-sm">Share thoughts and connect with your circle</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Enhanced Messages list */}
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                      {circleMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-10 h-10 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                          <p className="text-gray-600">Start the conversation and connect with your circle members!</p>
                        </div>
                      ) : (
                        circleMessages.map((message: CircleMessage) => {
                          const sender = message.sender || { firstName: 'Unknown', lastName: 'User', profileImageUrl: null };
                          const isCurrentUser = sender.id === user?.id;
                          return (
                            <div key={message.id} className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
                                <AvatarImage src={sender.profileImageUrl} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                  {sender.firstName.charAt(0)}{sender.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`flex-1 space-y-2 ${isCurrentUser ? 'text-right' : ''}`}>
                                <div className={`flex items-center space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <span className="font-semibold text-gray-900">
                                    {isCurrentUser ? 'You' : formatUserDisplayName(sender)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </span>
                                  {message.isAnnouncement && (
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                      Announcement
                                    </Badge>
                                  )}
                                </div>
                                <div className={`inline-block max-w-sm p-3 rounded-2xl ${
                                  isCurrentUser 
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm leading-relaxed">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  {/* Enhanced Message Input */}
                  <div className="border-t bg-gray-50 p-4 -mx-6 -mb-6 rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex space-x-3">
                      <div className="flex-1 relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Share your thoughts with the circle..."
                          className="pr-12 h-12 rounded-full border-2 border-gray-200 focus:border-blue-400 bg-white shadow-sm"
                        />
                        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                            >
                              <Smile className="w-4 h-4 text-blue-500" />
                            </Button>
                          </PopoverTrigger>
                        <PopoverContent className="w-80 p-2" align="end">
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700">Choose an emoji</div>
                            <Tabs defaultValue="smileys" className="w-full">
                              <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="smileys" className="text-xs">😊</TabsTrigger>
                                <TabsTrigger value="hearts" className="text-xs">❤️</TabsTrigger>
                                <TabsTrigger value="gestures" className="text-xs">👋</TabsTrigger>
                                <TabsTrigger value="activities" className="text-xs">⚽</TabsTrigger>
                                <TabsTrigger value="food" className="text-xs">🍕</TabsTrigger>
                                <TabsTrigger value="nature" className="text-xs">🌸</TabsTrigger>
                              </TabsList>
                              <div className="mt-3">
                                {Object.entries(emojis).map(([category, emojiList]) => (
                                  <TabsContent key={category} value={category}>
                                    <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                                      {emojiList.map((emoji, index) => (
                                        <button
                                          key={index}
                                          type="button"
                                          onClick={() => handleEmojiSelect(emoji)}
                                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </TabsContent>
                                ))}
                              </div>
                            </Tabs>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">Circle Members</CardTitle>
                      <CardDescription className="text-white/80">
                        {selectedCircleData?.memberCount || 0} member{(selectedCircleData?.memberCount || 0) !== 1 ? 's' : ''} in this circle
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Enhanced Members List */}
                    <div className="space-y-3">
                      {membersLoading ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading members</h3>
                          <p className="text-gray-600">Getting the latest member information...</p>
                        </div>
                      ) : membersError ? (
                        <div className="text-center text-red-500 py-12">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-red-700 mb-2">Error loading members</h3>
                          <p>{String(membersError)}</p>
                        </div>
                      ) : circleMembers.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-emerald-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
                          <p className="text-gray-600">Invite people to join your circle and start building your community!</p>
                        </div>
                      ) : (
                        circleMembers.map((member: any) => {
                          const memberUser = member.user || {};
                          // Use global privacy preference with circle-specific override
                          const showFullName = member.showFullName !== undefined ? member.showFullName : (memberUser.showFullName || false);
                          const displayName = formatUserDisplayName(memberUser, showFullName);
                          const fullName = `${memberUser.firstName || ''} ${memberUser.lastName || ''}`.trim();
                          const initials = getNameInitials(fullName);
                          const isOwner = selectedCircleData?.ownerId === member.userId;
                          const isCurrentUser = member.userId === user?.id;
                          
                          return (
                            <div 
                              key={member.id} 
                              className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                                isOwner 
                                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-md' 
                                  : isCurrentUser
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                                  : 'bg-white border-gray-200 hover:border-emerald-300'
                              }`}
                            >
                              <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                                <AvatarImage src={memberUser.profileImageUrl} />
                                <AvatarFallback className={`text-white font-semibold ${
                                  isOwner 
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                                    : isCurrentUser
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-semibold text-gray-900">
                                    {isCurrentUser ? 'You' : displayName}
                                  </p>
                                  {isOwner && (
                                    <div className="flex items-center space-x-1">
                                      <Crown className="w-4 h-4 text-amber-500" />
                                      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">
                                        Owner
                                      </Badge>
                                    </div>
                                  )}
                                  {!isOwner && (
                                    <Badge 
                                      variant={member.status === 'active' ? 'default' : 'secondary'}
                                      className={`text-xs ${
                                        isCurrentUser 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {isCurrentUser ? 'You' : member.status}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {isOwner 
                                    ? 'Created this circle' 
                                    : `Joined ${new Date(member.joinedAt).toLocaleDateString()}`
                                  }
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!isCurrentUser && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMessageMember(member)}
                                    className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message
                                  </Button>
                                )}
                                
                                {/* Remove member button (for circle owner) */}
                                {!isCurrentUser && selectedCircleData?.ownerId === user?.id && !isOwner && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveMember(member)}
                                    className="shrink-0 bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Remove
                                  </Button>
                                )}
                                
                                {/* Leave circle button (for current user who isn't owner) */}
                                {isCurrentUser && !isOwner && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleLeaveCircle()}
                                    className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Leave Circle
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Direct Messages Tab */}
            <TabsContent value="direct-messages" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Direct Messages</h3>
                <Badge variant="secondary">
                  {circleMembers.filter(m => m.userId !== user?.id).length} members
                </Badge>
              </div>

              <div className="grid gap-3">
                {!circleMembers || circleMembers.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No members to message yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  circleMembers
                    .filter(member => member.userId !== user?.id)
                    .map((member) => {
                      const memberUser = member.user || { firstName: 'Unknown', lastName: 'User', profileImageUrl: null };
                      const fullName = `${memberUser.firstName || ''} ${memberUser.lastName || ''}`.trim();
                      return (
                        <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={memberUser.profileImageUrl} />
                                  <AvatarFallback>
                                    {getNameInitials(fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {formatUserDisplayName(memberUser, member.showFullName !== undefined ? member.showFullName : (memberUser.showFullName || false))}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Circle member • Tap to message privately
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleMessageMember(member)}
                                  className="bg-pink-600 hover:bg-pink-700"
                                  disabled={member.userId === user?.id}
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  {member.userId === user?.id ? 'You' : 'Message'}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                )}
              </div>
            </TabsContent>

            {/* Enhanced Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">Recent Activities</CardTitle>
                      <p className="text-white/80 text-sm">Track what's happening in your circle</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                      {circleActivities.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-10 h-10 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
                          <p className="text-gray-600">Activities will appear here as members interact with the circle</p>
                        </div>
                      ) : (
                        circleActivities.map((activity: CircleActivity) => {
                          const activityUser = activity.user || { firstName: 'Unknown', lastName: 'User', profileImageUrl: null };
                          return (
                            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-md">
                              <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
                                <AvatarImage src={activityUser.profileImageUrl} />
                                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                                  {activityUser.firstName.charAt(0)}{activityUser.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    {formatUserDisplayName(activityUser)}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{activity.description}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                    {activity.activityType}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">Circle Events</CardTitle>
                        <p className="text-white/80 text-sm">Plan and organize circle activities</p>
                      </div>
                    </div>
                    <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Circle Event</DialogTitle>
                      <DialogDescription>
                        Create an event for circle members
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div>
                        <Label htmlFor="eventTitle">Event Title</Label>
                        <Input
                          id="eventTitle"
                          value={eventFormData.title}
                          onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Weekend Hiking Trip"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventDescription">Description</Label>
                        <Textarea
                          id="eventDescription"
                          value={eventFormData.description}
                          onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the event..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventDate">Date & Time</Label>
                        <Input
                          id="eventDate"
                          type="datetime-local"
                          value={eventFormData.eventDate}
                          onChange={(e) => setEventFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input
                          id="eventLocation"
                          value={eventFormData.location}
                          onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Event location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxAttendees">Max Attendees</Label>
                        <Input
                          id="maxAttendees"
                          type="number"
                          value={eventFormData.maxAttendees}
                          onChange={(e) => setEventFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isVirtual"
                          checked={eventFormData.isVirtual}
                          onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, isVirtual: checked }))}
                        />
                        <Label htmlFor="isVirtual">Virtual Event</Label>
                      </div>
                      {eventFormData.isVirtual && (
                        <div>
                          <Label htmlFor="meetingLink">Meeting Link</Label>
                          <Input
                            id="meetingLink"
                            value={eventFormData.meetingLink}
                            onChange={(e) => setEventFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                      )}
                      <Button type="submit" className="w-full">
                        Create Event
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                {circleEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No events scheduled</h3>
                    <p className="text-gray-600">Create an event to bring your circle together!</p>
                  </div>
                ) : (
                  circleEvents.map((event: CircleEvent) => {
                    const creator = event.creator || { firstName: 'Unknown', lastName: 'User', profileImageUrl: null };
                    const eventDate = new Date(event.eventDate);
                    const isUpcoming = eventDate > new Date();
                    
                    return (
                      <Card key={event.id} className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${isUpcoming ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                                {event.isVirtual && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    Virtual
                                  </Badge>
                                )}
                              </div>
                              
                              {event.description && (
                                <p className="text-gray-600 leading-relaxed">{event.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">
                                    {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                {event.location && (
                                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                
                                {event.maxAttendees && (
                                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <Users className="w-4 h-4" />
                                    <span>Max {event.maxAttendees} attendees</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2 ml-4">
                              <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                                <AvatarImage src={creator.profileImageUrl} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                                  {creator.firstName.charAt(0)}{creator.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-gray-500 text-center">
                                Created by<br />
                                <span className="font-medium">{formatUserDisplayName(creator)}</span>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Direct Message Dialog */}
          {console.log('Render check - directMessageState.open:', directMessageState.open, 'dialogKey:', dialogKey)}
          {directMessageState.open ? (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                width: '500px',
                maxWidth: '95vw',
                height: '600px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Header */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={directMessageState.member?.user?.profileImageUrl || '/api/placeholder/40/40'} 
                      alt={directMessageState.member?.user?.firstName}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        backgroundColor: '#f3f4f6'
                      }}
                    />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                        {formatUserDisplayName(directMessageState.member?.user)}
                      </h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Direct Message</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDirectMessageState({ open: false, member: null, message: '', conversation: [], isLoadingConversation: false });
                      setIsDMEmojiPickerOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Messages Area */}
                <div style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  backgroundColor: '#f9fafb'
                }}>
                  {directMessageState.isLoadingConversation ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                      Loading conversation...
                    </div>
                  ) : directMessageState.conversation.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                      Start a conversation with {formatUserDisplayName(directMessageState.member?.user)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {directMessageState.conversation.map((message: any, index: number) => {
                        const isCurrentUser = message.senderId === user?.id;
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                          }}>
                            <div style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: '18px',
                              backgroundColor: isCurrentUser ? '#e91e63' : '#ffffff',
                              color: isCurrentUser ? 'white' : '#111827',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                            }}>
                              <p style={{ margin: 0, fontSize: '14px' }}>{message.content}</p>
                              <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '11px', 
                                opacity: 0.7,
                                textAlign: 'right'
                              }}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb',
                  position: 'relative'
                }}>
                  {/* Emoji Picker for DM */}
                  {isDMEmojiPickerOpen && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '20px',
                      right: '20px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Add Emoji</h4>
                        <button
                          onClick={() => setIsDMEmojiPickerOpen(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      
                      {Object.entries(emojis).map(([category, categoryEmojis]) => (
                        <div key={category} style={{ marginBottom: '12px' }}>
                          <h5 style={{ 
                            margin: '0 0 6px 0', 
                            fontSize: '12px', 
                            fontWeight: 'bold', 
                            textTransform: 'capitalize',
                            color: '#6b7280'
                          }}>
                            {category}
                          </h5>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(8, 1fr)',
                            gap: '4px'
                          }}>
                            {categoryEmojis.slice(0, 16).map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => handleDMEmojiSelect(emoji)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '18px',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={handleSendDirectMessage} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <textarea
                        value={directMessageState.message}
                        onChange={(e) => setDirectMessageState({
                          ...directMessageState,
                          message: e.target.value
                        })}
                        placeholder={`Message ${directMessageState.member?.user?.firstName}...`}
                        style={{
                          width: '100%',
                          padding: '12px 50px 12px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '20px',
                          resize: 'none',
                          minHeight: '40px',
                          maxHeight: '100px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (directMessageState.message.trim()) {
                              handleSendDirectMessage(e as any);
                            }
                          }
                        }}
                      />
                      
                      {/* Emoji Button */}
                      <button
                        type="button"
                        onClick={() => setIsDMEmojiPickerOpen(!isDMEmojiPickerOpen)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          bottom: '8px',
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        😊
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!directMessageState.message.trim()}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: directMessageState.message.trim() ? '#e91e63' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: directMessageState.message.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 mobile-nav-padding">
        <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12">
          {/* Back Navigation */}
          <div className="flex items-center justify-start mb-6">
            <Link to="/">
              <Button 
                variant="ghost" 
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Trust Hub
              </Button>
            </Link>
          </div>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            My Circles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Connect with like-minded people through specialized interest groups and shared experiences
          </p>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm(); // Reset form when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Circle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create New Circle
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-base">
                  Create a special circle and invite other daters to join your community
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateCircle} className="space-y-4">
                <div>
                  <Label htmlFor="name">Circle Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Adventure Seekers"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this circle is about..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="adventure">Adventure & Travel</SelectItem>
                      <SelectItem value="fitness">Fitness & Health</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="culture">Arts & Culture</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="hobbies">Hobbies & Interests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isPrivate" 
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                  />
                  <Label htmlFor="isPrivate">Private Circle</Label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCircleMutation.isPending}
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {createCircleMutation.isPending ? "Creating..." : "Create Circle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white shadow-lg rounded-full p-1 border">
              <TabsTrigger 
                value="my-circles" 
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                My Circles
              </TabsTrigger>
              <TabsTrigger 
                value="joined-circles"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                Joined Circles
              </TabsTrigger>
              <TabsTrigger 
                value="invitations" 
                className="relative rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                Invitations
                {pendingInvitations.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse">
                    {pendingInvitations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-circles" className="space-y-4">
            {isLoadingMyCircles ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myCircles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Circles Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first circle to connect with like-minded daters</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-pink-500 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Circle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCircles.map((circle: Circle) => (
                  <Card key={circle.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {circle.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                  {circle.category}
                                </Badge>
                                {circle.isPrivate && (
                                  <Badge variant="outline" className="text-xs">
                                    Private
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-gray-600 line-clamp-2">
                            {circle.description || "No description available"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCircle(circle);
                              setIsInviteDialogOpen(true);
                            }}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Invite Members
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenSettings(circle)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenDeleteDialog(circle)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Circle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{circle.memberCount}</span>
                            <span>member{circle.memberCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(circle.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleOpenCircle(circle)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Circle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="joined-circles" className="space-y-4">
            {isLoadingJoinedCircles ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : joinedCircles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Joined Circles</h3>
                  <p className="text-gray-600">You haven't joined any circles yet. Accept invitations to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedCircles.map((membership: CircleMembership) => (
                  <Card key={membership.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {membership.circle.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {membership.circle.category}
                            </Badge>
                            <Badge variant={membership.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                              {membership.role}
                            </Badge>
                            {membership.circle.isPrivate && (
                              <Badge variant="outline" className="text-xs">
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-gray-600 line-clamp-2">
                        {membership.circle.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{membership.circle.memberCount}</span>
                            <span>member{membership.circle.memberCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(membership.joinedAt), { addSuffix: true })}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleOpenCircle(membership)}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Circle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            {isLoadingInvitations ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : invitations.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invitations</h3>
                  <p className="text-gray-600">You don't have any circle invitations at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {invitations.map((invitation: CircleInvitation) => (
                  <Card key={invitation.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                              Invitation to "{invitation.circle.name}"
                            </CardTitle>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={invitation.inviter.profileImageUrl || '/default-avatar.png'} 
                                  alt={`${invitation.inviter.firstName} ${invitation.inviter.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <CardDescription className="text-gray-600 font-medium">
                                  From {formatUserDisplayName(invitation.inviter)}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                {invitation.circle.category}
                              </Badge>
                            </div>
                            {invitation.message && (
                              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500">
                                <p className="text-sm text-gray-700 italic">
                                  "{invitation.message}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            invitation.status === 'pending' ? 'default' :
                            invitation.status === 'accepted' ? 'secondary' : 'destructive'
                          }
                          className="ml-4"
                        >
                          {invitation.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    {invitation.status === 'pending' && (
                      <CardContent className="pt-0">
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                            disabled={respondToInvitationMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-2.5 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Invitation
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRespondToInvitation(invitation.id, 'rejected')}
                            disabled={respondToInvitationMutation.isPending}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-medium py-2.5 transition-all duration-300"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Invite Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Invite to {selectedCircle?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                Send an invitation to another dater to join your circle community
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">User Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter the user's email address"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                <Textarea
                  id="inviteMessage"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={sendInvitationMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  {sendInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Circle Settings
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                Manage settings for "{settingsCircle?.name}" circle
              </DialogDescription>
            </DialogHeader>
            
            {settingsCircle && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-900">Privacy Settings</h4>
                  
                  {/* Circle Privacy Control */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {settingsCircle.isPrivate ? "Private Circle" : "Public Circle"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {settingsCircle.isPrivate 
                          ? "Only invited members can join this circle"
                          : "Anyone can discover and request to join this circle"
                        }
                      </div>
                    </div>
                    <Switch
                      checked={settingsCircle.isPrivate}
                      onCheckedChange={handleUpdatePrivacy}
                      disabled={updateCircleMutation.isPending}
                    />
                  </div>

                  {/* Member Visibility Control */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {(settingsCircle.showMembers ?? true) ? "Show Members" : "Hide Members"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {(settingsCircle.showMembers ?? true) 
                          ? "Other daters can see who's in this circle when viewing your profile"
                          : "Circle members are hidden from profile viewers for extra privacy"
                        }
                      </div>
                    </div>
                    <Switch
                      checked={settingsCircle.showMembers ?? true}
                      onCheckedChange={handleUpdateMemberVisibility}
                      disabled={updateCircleMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-900">Circle Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span>{settingsCircle.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <Badge variant="secondary">{settingsCircle.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{formatDistanceToNow(new Date(settingsCircle.createdAt))} ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSettingsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Delete Circle
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                Are you sure you want to delete "{circleToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-3 text-base">This will permanently:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span>Delete the circle and all its content</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span>Remove all {circleToDelete?.memberCount} members</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span>Delete all messages and activities</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span>Cancel any upcoming events</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmDelete}
                  disabled={deleteCircleMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteCircleMutation.isPending ? "Deleting..." : "Delete Circle"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        </div>
      </div>
    </>
  );
}