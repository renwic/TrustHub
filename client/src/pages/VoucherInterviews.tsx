import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Users, Clock, CheckCircle, XCircle, Plus, Send } from "lucide-react";

const interviewRequestSchema = z.object({
  questions: z.array(z.string().min(1)).min(1, "At least one question is required"),
});

type InterviewRequestData = z.infer<typeof interviewRequestSchema>;

export default function RealOneInterviews() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedRealOne, setSelectedRealOne] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [questions, setQuestions] = useState<string[]>([""]);

  // Get matches with RealOne permissions
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches"],
    retry: false,
  });

  // Get RealOne interviews for current user
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["/api/realOne-interviews"],
    retry: false,
  });

  const form = useForm<InterviewRequestData>({
    resolver: zodResolver(interviewRequestSchema),
    defaultValues: {
      questions: [""],
    },
  });

  const requestInterviewMutation = useMutation({
    mutationFn: async (data: { matchId: number; realOneId: number; questions: string[] }) => {
      return await apiRequest("POST", "/api/realOne-interviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Interview requested!",
        description: "Your questions have been sent to the RealOne.",
      });
      setShowRequestDialog(false);
      setQuestions([""]);
      queryClient.invalidateQueries({ queryKey: ["/api/realOne-interviews"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to request interview. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleRequestInterview = () => {
    const validQuestions = questions.filter(q => q.trim().length > 0);
    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMatch || !selectedRealOne) {
      toast({
        title: "Error",
        description: "Please select a match and RealOne.",
        variant: "destructive",
      });
      return;
    }

    requestInterviewMutation.mutate({
      matchId: selectedMatch.id,
      realOneId: selectedRealOne.id,
      questions: validQuestions,
    });
  };

  if (matchesLoading || interviewsLoading) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading RealOne interviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Voucher Interviews" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="interviews">My Interviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-4">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Interview RealOnes</h2>
                <p className="text-sm text-slate-600">
                  Ask questions to RealOnes of people you've matched with to get insights from trusted references.
                </p>
              </div>

              {matches.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-800 mb-2">No matches yet</h3>
                    <p className="text-sm text-slate-600">
                      Start swiping to find matches, then you can interview their RealOnes!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {matches.map((match: any) => (
                    <Card key={match.id}>
                      <CardHeader>
                        <CardTitle className="text-base">Match #{match.id}</CardTitle>
                        <CardDescription>
                          Matched on {new Date(match.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">RealOnes available:</span>
                            <Badge variant="secondary">3 RealOnes</Badge>
                          </div>
                          
                          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full" 
                                onClick={() => setSelectedMatch(match)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Request RealOne Interview
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Request RealOne Interview</DialogTitle>
                                <DialogDescription>
                                  Ask questions to learn more about this person from their trusted RealOnes.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Select RealOne</Label>
                                  <div className="mt-2 space-y-2">
                                    {[
                                      { id: 1, name: "Sarah Chen", relationship: "Best Friend" },
                                      { id: 2, name: "Marcus Johnson", relationship: "Colleague" },
                                      { id: 3, name: "Emma Wilson", relationship: "Sister" },
                                    ].map((realOne) => (
                                      <Card 
                                        key={realOne.id}
                                        className={`cursor-pointer transition-colors ${
                                          selectedRealOne?.id === realOne.id ? 'ring-2 ring-primary' : ''
                                        }`}
                                        onClick={() => setSelectedRealOne(realOne)}
                                      >
                                        <CardContent className="p-3">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="font-medium text-sm">{realOne.name}</p>
                                              <p className="text-xs text-slate-500">{realOne.relationship}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              Available
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Questions</Label>
                                  <div className="mt-2 space-y-2">
                                    {questions.map((question, index) => (
                                      <div key={index} className="flex space-x-2">
                                        <Textarea
                                          placeholder={`Question ${index + 1}...`}
                                          value={question}
                                          onChange={(e) => updateQuestion(index, e.target.value)}
                                          className="flex-1 min-h-[80px]"
                                        />
                                        {questions.length > 1 && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeQuestion(index)}
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={addQuestion}
                                      className="w-full"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Question
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex space-x-2 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowRequestDialog(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleRequestInterview}
                                    disabled={requestInterviewMutation.isPending}
                                    className="flex-1"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {requestInterviewMutation.isPending ? "Sending..." : "Send Request"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="interviews" className="mt-4">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-2">My Interview Requests</h2>
                <p className="text-sm text-slate-600">
                  Track your RealOne interview requests and view responses.
                </p>
              </div>

              {interviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-800 mb-2">No interviews yet</h3>
                    <p className="text-sm text-slate-600">
                      Request interviews with RealOnes to learn more about your matches.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Sample interview requests */}
                  {[
                    {
                      id: 1,
                      voucherName: "Sarah Chen",
                      relationship: "Best Friend",
                      status: "pending",
                      questions: ["What's their best quality?", "How do they handle stress?"],
                      requestedAt: new Date(),
                    },
                    {
                      id: 2,
                      voucherName: "Marcus Johnson", 
                      relationship: "Colleague",
                      status: "completed",
                      questions: ["How are they as a teammate?"],
                      responses: ["They're incredibly reliable and always supportive of others."],
                      requestedAt: new Date(Date.now() - 86400000),
                      completedAt: new Date(Date.now() - 43200000),
                    },
                  ].map((interview) => (
                    <Card key={interview.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{interview.voucherName}</CardTitle>
                            <CardDescription>{interview.relationship}</CardDescription>
                          </div>
                          <Badge 
                            variant={interview.status === 'completed' ? 'default' : 'secondary'}
                            className={interview.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {interview.status === 'completed' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Questions:</p>
                            <ul className="space-y-1">
                              {interview.questions.map((q, i) => (
                                <li key={i} className="text-sm text-slate-600 pl-2 border-l-2 border-slate-200">
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {interview.status === 'completed' && interview.responses && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-2">Responses:</p>
                              <div className="space-y-2">
                                {interview.responses.map((response, i) => (
                                  <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-800">{response}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-slate-500">
                            Requested {interview.requestedAt.toLocaleDateString()}
                            {interview.completedAt && ` • Completed ${interview.completedAt.toLocaleDateString()}`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}