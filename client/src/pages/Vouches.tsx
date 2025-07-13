import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Copy, Check, Mail, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { vouchRequestInviteSchema, type VouchRequestInviteData, type VouchRequest } from "@shared/schema";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";

export default function Vouches() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vouchRequests, isLoading } = useQuery({
    queryKey: ["/api/prop-requests"],
  });

  const form = useForm<VouchRequestInviteData>({
    resolver: zodResolver(vouchRequestInviteSchema),
    defaultValues: {
      recipientEmail: "",
      recipientName: "",
      relationship: "",
      personalMessage: "",
    },
  });

  const createVouchRequestMutation = useMutation({
    mutationFn: async (data: VouchRequestInviteData) => {
      return await apiRequest("/api/prop-requests", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prop-requests"] });
      form.reset();
      setShowInviteForm(false);
      toast({
        title: "Invitation sent!",
        description: "Your prop request has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create prop request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Link copied!",
        description: "The prop link has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Vouches" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Manage Your Vouches</h1>
            <p className="text-gray-600">
              Invite friends and family to give you a prop on your dating profile.
              Their testimonials help build trust with potential matches.
            </p>
          </div>

        <div className="grid gap-6">
          {/* Invite New Voucher Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invite Someone to Give a Prop</CardTitle>
                  <CardDescription>
                    Send a personalized invitation to friends, family, or colleagues
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Invitation
                </Button>
              </div>
            </CardHeader>
            {showInviteForm && (
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => createVouchRequestMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Their Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Sarah Johnson" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Their Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="sarah@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Relationship</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Best Friend, Sister, Coworker"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personal Message (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a personal note to include with the invitation..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createVouchRequestMutation.isPending}
                      >
                        {createVouchRequestMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowInviteForm(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            )}
          </Card>

          {/* Prop Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Prop Invitations</CardTitle>
              <CardDescription>
                Track the status of your sent invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading invitations...</p>
                </div>
              ) : !vouchRequests || vouchRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No invitations sent yet</p>
                  <p className="text-sm text-gray-500">
                    Start by inviting someone you trust to give you a prop
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vouchRequests.map((request: VouchRequest & { shareUrl?: string }) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{request.recipientName}</h3>
                          <p className="text-sm text-gray-600">{request.relationship}</p>
                          <p className="text-xs text-gray-500">{request.recipientEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        {request.status === "pending" && request.shareUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyUrl(request.shareUrl!)}
                            className="flex items-center gap-1"
                          >
                            {copiedUrl === request.shareUrl ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedUrl === request.shareUrl ? "Copied!" : "Copy Link"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}