import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Settings, 
  BarChart3, 
  Eye,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Ban,
  UnlockKeyhole,
  MessageSquare,
  Flag,
  Plus,
  Save,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalProfiles: number;
  verifiedProfiles: number;
  pendingReports: number;
  pendingModerations: number;
  pendingVerifications: number;
}

interface AdminAction {
  id: number;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

interface ModerationItem {
  id: number;
  contentType: string;
  contentId: string;
  reportedBy: string;
  reason: string;
  status: string;
  priority: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [actionFilters, setActionFilters] = useState({
    action: "",
    targetType: "",
    page: 1
  });
  const [userFilters, setUserFilters] = useState({
    search: "",
    status: "all",
    role: "all",
    page: 1
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModerationItem, setSelectedModerationItem] = useState<ModerationItem | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isModerationDialogOpen, setIsModerationDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin dashboard stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    retry: false,
  });

  // Fetch admin actions
  const { data: actionsData, isLoading: actionsLoading } = useQuery({
    queryKey: ["/api/admin/actions", actionFilters],
    retry: false,
  });

  // Fetch user analytics
  const { data: userAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/users"],
    retry: false,
  });

  // Fetch moderation queue
  const { data: moderationQueue } = useQuery({
    queryKey: ["/api/admin/moderation/queue"],
    retry: false,
  });

  // Fetch users for management
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users", userFilters],
    retry: false,
  });

  // User management mutations
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/suspend`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User suspended successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsUserDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to suspend user", variant: "destructive" });
    },
  });

  const reactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/reactivate`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User reactivated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsUserDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reactivate user", variant: "destructive" });
    },
  });

  const changeUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    },
  });

  const resolveModerationMutation = useMutation({
    mutationFn: async ({ itemId, status, notes }: { itemId: number; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/moderation/${itemId}/resolve`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Moderation item resolved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsModerationDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to resolve moderation item", variant: "destructive" });
    },
  });

  const handleRefresh = () => {
    refetchStats();
  };

  if (statsLoading) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-6xl mx-auto relative overflow-hidden">
          <div className="lg:hidden">
            <Header title="Admin Dashboard" />
          </div>
          <main className="p-4 mobile-nav-padding">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-6xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Admin Dashboard" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
          {/* Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                <p className="text-lg text-slate-600">Platform management and oversight</p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.activeUsers || 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verified Profiles</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.verifiedProfiles || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      of {stats?.totalProfiles || 0} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingReports || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Moderation Queue</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingModerations || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Items pending
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("moderation")}>
                      <Shield className="w-4 h-4 mr-2" />
                      Review Moderation Queue
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("users")}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("settings")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Platform Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage platform users and their accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Search users by name or email..." 
                          className="pl-10"
                          value={userFilters.search}
                          onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        />
                      </div>
                      <Select value={userFilters.status} onValueChange={(value) => setUserFilters(prev => ({ ...prev, status: value, page: 1 }))}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={userFilters.role} onValueChange={(value) => setUserFilters(prev => ({ ...prev, role: value, page: 1 }))}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : usersData?.users?.length > 0 ? (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead>Last Active</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usersData.users.map((user: User) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={user.role === 'administrator' ? 'destructive' : user.role === 'moderator' ? 'default' : 'secondary'}>
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={user.isSuspended ? 'destructive' : user.isActive ? 'default' : 'secondary'}>
                                    {user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsUserDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Manage
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Showing {((userFilters.page - 1) * 10) + 1} to {Math.min(userFilters.page * 10, usersData.total)} of {usersData.total} users
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={userFilters.page === 1}
                              onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={userFilters.page * 10 >= usersData.total}
                              onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No users found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Moderation Queue</CardTitle>
                  <CardDescription>Review reported content and take moderation actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="message">Message</SelectItem>
                          <SelectItem value="photo">Photo</SelectItem>
                          <SelectItem value="testimonial">Testimonial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {moderationQueue?.items && moderationQueue.items.length > 0 ? (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Content</TableHead>
                              <TableHead>Reporter</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {moderationQueue.items.map((item: ModerationItem) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">{item.contentType}</div>
                                    <div className="text-sm text-gray-500">ID: {item.contentId}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">{item.reportedBy}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{item.reason}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                                    {item.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.status === 'pending' ? 'default' : item.status === 'resolved' ? 'destructive' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedModerationItem(item);
                                      setIsModerationDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No moderation items in queue</p>
                        <p className="text-sm">All reports have been reviewed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>Configure platform-wide settings and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">User Registration</Label>
                          <p className="text-sm text-gray-500">Allow new users to register</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Profile Verification</Label>
                          <p className="text-sm text-gray-500">Require manual profile verification</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-Moderation</Label>
                          <p className="text-sm text-gray-500">Enable automated content moderation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Public Registration</Label>
                          <p className="text-sm text-gray-500">Platform is publicly accessible</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Save Platform Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Feature Flags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Enable or disable platform features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Real-time Messaging</Label>
                          <p className="text-sm text-gray-500">Enable chat functionality</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Props System</Label>
                          <p className="text-sm text-gray-500">Allow users to give and receive props</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">RealOne Interviews</Label>
                          <p className="text-sm text-gray-500">Enable voucher interview system</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Photo Sharing</Label>
                          <p className="text-sm text-gray-500">Allow photo uploads and sharing</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Feature Flags
                    </Button>
                  </CardContent>
                </Card>

                {/* Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Announcements</CardTitle>
                    <CardDescription>Manage platform-wide announcements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Announcement Title</Label>
                        <Input placeholder="Enter announcement title..." className="mt-2" />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Message</Label>
                        <Textarea 
                          placeholder="Enter announcement message..." 
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Announcement
                    </Button>
                  </CardContent>
                </Card>

                {/* System Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Analytics</CardTitle>
                    <CardDescription>Platform performance and usage statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">98.5%</div>
                        <div className="text-sm text-gray-500">Uptime</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">1.2s</div>
                        <div className="text-sm text-gray-500">Avg Response</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats?.totalUsers || 0}</div>
                        <div className="text-sm text-gray-500">Total Users</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats?.activeUsers || 0}</div>
                        <div className="text-sm text-gray-500">Active Today</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions Log</CardTitle>
                  <CardDescription>Track all administrative actions taken on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Select value={actionFilters.action} onValueChange={(value) => setActionFilters(prev => ({ ...prev, action: value }))}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Actions</SelectItem>
                          <SelectItem value="suspend_user">Suspend User</SelectItem>
                          <SelectItem value="verify_profile">Verify Profile</SelectItem>
                          <SelectItem value="moderate_content">Moderate Content</SelectItem>
                          <SelectItem value="update_settings">Update Settings</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={actionFilters.targetType} onValueChange={(value) => setActionFilters(prev => ({ ...prev, targetType: value }))}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Target type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="setting">Setting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {actionsData?.actions && actionsData.actions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {actionsData.actions.map((action: AdminAction) => (
                            <TableRow key={action.id}>
                              <TableCell>
                                <Badge variant="outline">
                                  {action.action.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {action.targetType}: {action.targetId}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {action.adminId}
                              </TableCell>
                              <TableCell>
                                {new Date(action.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No admin actions found</p>
                        <p className="text-sm">Actions will appear here as you perform administrative tasks</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* User Management Dialog */}
          <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage User</DialogTitle>
                <DialogDescription>
                  Update user permissions and account status
                </DialogDescription>
              </DialogHeader>
              
              {selectedUser && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">User Information</Label>
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Status</Label>
                      <div className="mt-2 space-y-2">
                        <Badge variant={selectedUser.role === 'administrator' ? 'destructive' : selectedUser.role === 'moderator' ? 'default' : 'secondary'}>
                          {selectedUser.role}
                        </Badge>
                        <Badge variant={selectedUser.isSuspended ? 'destructive' : selectedUser.isActive ? 'default' : 'secondary'}>
                          {selectedUser.isSuspended ? 'Suspended' : selectedUser.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Change Role</Label>
                      <Select 
                        defaultValue={selectedUser.role}
                        onValueChange={(role) => {
                          changeUserRoleMutation.mutate({ userId: selectedUser.id, role });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4">
                      {selectedUser.isSuspended ? (
                        <Button
                          onClick={() => reactivateUserMutation.mutate(selectedUser.id)}
                          disabled={reactivateUserMutation.isPending}
                          className="flex-1"
                        >
                          <UnlockKeyhole className="w-4 h-4 mr-2" />
                          {reactivateUserMutation.isPending ? "Reactivating..." : "Reactivate User"}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt("Reason for suspension:");
                            if (reason) {
                              suspendUserMutation.mutate({ userId: selectedUser.id, reason });
                            }
                          }}
                          disabled={suspendUserMutation.isPending}
                          className="flex-1"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {suspendUserMutation.isPending ? "Suspending..." : "Suspend User"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Moderation Dialog */}
          <Dialog open={isModerationDialogOpen} onOpenChange={setIsModerationDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Moderation Item</DialogTitle>
                <DialogDescription>
                  Review reported content and take appropriate action
                </DialogDescription>
              </DialogHeader>
              
              {selectedModerationItem && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Content Information</Label>
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">Type: {selectedModerationItem.contentType}</p>
                        <p className="text-sm text-gray-500">ID: {selectedModerationItem.contentId}</p>
                        <p className="text-sm text-gray-500">Reported by: {selectedModerationItem.reportedBy}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Report Details</Label>
                      <div className="mt-2 space-y-2">
                        <Badge variant="outline">{selectedModerationItem.reason}</Badge>
                        <Badge variant={selectedModerationItem.priority === 'high' ? 'destructive' : selectedModerationItem.priority === 'medium' ? 'default' : 'secondary'}>
                          {selectedModerationItem.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <Textarea
                      placeholder="Add moderation notes..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        resolveModerationMutation.mutate({
                          itemId: selectedModerationItem.id,
                          status: 'resolved',
                          notes: 'Content removed for policy violation'
                        });
                      }}
                      disabled={resolveModerationMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Remove Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resolveModerationMutation.mutate({
                          itemId: selectedModerationItem.id,
                          status: 'dismissed',
                          notes: 'Report dismissed - no policy violation'
                        });
                      }}
                      disabled={resolveModerationMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
}