import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Heart, MapPin, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const matchPreferencesSchema = z.object({
  ageRangeMin: z.number().min(18).max(100),
  ageRangeMax: z.number().min(18).max(100),
  maxDistance: z.number().min(1).max(500),
  interestedIn: z.enum(['men', 'women', 'everyone']),
  preferredRelationshipType: z.enum(['serious', 'casual', 'friends', 'any']),
  minimumRealRep: z.number().min(0).max(100),
  mustHaveProps: z.boolean(),
});

type MatchPreferencesData = z.infer<typeof matchPreferencesSchema>;

interface MatchPreferences extends MatchPreferencesData {
  id: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function MatchPreferences() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<MatchPreferences>({
    queryKey: ['/api/preferences/match'],
  });

  const form = useForm<MatchPreferencesData>({
    resolver: zodResolver(matchPreferencesSchema),
    defaultValues: {
      ageRangeMin: preferences?.ageRangeMin || 22,
      ageRangeMax: preferences?.ageRangeMax || 35,
      maxDistance: preferences?.maxDistance || 50,
      interestedIn: preferences?.interestedIn || 'everyone',
      preferredRelationshipType: preferences?.preferredRelationshipType || 'any',
      minimumRealRep: preferences?.minimumRealRep || 0,
      mustHaveProps: preferences?.mustHaveProps || false,
    },
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      form.reset({
        ageRangeMin: preferences.ageRangeMin,
        ageRangeMax: preferences.ageRangeMax,
        maxDistance: preferences.maxDistance,
        interestedIn: preferences.interestedIn,
        preferredRelationshipType: preferences.preferredRelationshipType,
        minimumRealRep: preferences.minimumRealRep,
        mustHaveProps: preferences.mustHaveProps,
      });
    }
  }, [preferences, form]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: MatchPreferencesData) => {
      await apiRequest('/api/preferences/match', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences/match'] });
      setIsEditing(false);
      toast({
        title: "Preferences Updated",
        description: "Your match preferences have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MatchPreferencesData) => {
    savePreferencesMutation.mutate(data);
  };

  const ageRange = form.watch(['ageRangeMin', 'ageRangeMax']);
  const maxDistance = form.watch('maxDistance');
  const minimumRealRep = form.watch('minimumRealRep');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle>Match Preferences</CardTitle>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Age Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <FormLabel>Age Range</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          disabled={!isEditing}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          disabled={!isEditing}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-slate-600">
                Ages {ageRange[0]} - {ageRange[1]}
              </p>
            </div>

            {/* Distance */}
            <FormField
              control={form.control}
              name="maxDistance"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <FormLabel>Maximum Distance</FormLabel>
                  </div>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={500}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        disabled={!isEditing}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-600">
                        Within {maxDistance} km
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interested In */}
            <FormField
              control={form.control}
              name="interestedIn"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-slate-500" />
                    <FormLabel>Interested In</FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Relationship Type */}
            <FormField
              control={form.control}
              name="preferredRelationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Looking For</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="serious">Serious Relationship</SelectItem>
                      <SelectItem value="casual">Casual Dating</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="any">Open to Anything</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minimum RealBar */}
            <FormField
              control={form.control}
              name="minimumRealRep"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <FormLabel>Minimum RealBar Score</FormLabel>
                  </div>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        disabled={!isEditing}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-600">
                        At least {minimumRealRep}% RealBar score
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Must Have Props */}
            <FormField
              control={form.control}
              name="mustHaveProps"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Must Have Props</FormLabel>
                    <FormDescription>
                      Only show profiles with testimonials from RealOnes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditing}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isEditing && (
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={savePreferencesMutation.isPending}
                  className="flex-1"
                >
                  {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}