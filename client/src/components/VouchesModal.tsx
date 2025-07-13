import { useQuery } from "@tanstack/react-query";
import { X, Star, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNameWithInitials } from "@/lib/nameUtils";

interface PropsModalProps {
  profileId: number;
  profileName: string;
  onClose: () => void;
}

export default function PropsModal({ profileId, profileName, onClose }: PropsModalProps) {
  const { data: props = [], isLoading } = useQuery({
    queryKey: [`/api/profiles/${profileId}/testimonials`],
    retry: false,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold">Props for {profileName}</h2>
            <p className="text-sm text-slate-500">{props.length} RealOnes gave {profileName} props</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin"></div>
            </div>
          ) : props.length === 0 ? (
            <div className="text-center py-8 px-4">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No props yet</p>
              <p className="text-sm text-slate-400 mt-1">
                {profileName} hasn't received any props from their RealOnes yet
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {props.map((prop: any) => (
                <Card key={prop.id} className="border border-slate-100">
                  <CardContent className="p-4">
                    {/* Author Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{formatNameWithInitials(prop.authorName || 'Anonymous', false)}</p>
                        <Badge variant="outline" className="text-xs">
                          {prop.relationship}
                        </Badge>
                      </div>
                    </div>

                    {/* Prop Content */}
                    <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                      "{prop.content}"
                    </p>

                    {/* Ratings */}
                    {prop.ratings && (
                      <div className="space-y-2">
                        {Object.entries(prop.ratings).map(([trait, rating]: [string, any]) => (
                          <div key={trait} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 capitalize">
                              {trait.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Heart
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rating
                                      ? 'text-red-400 fill-current'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            Props are written by verified RealOnes who know them personally
          </p>
        </div>
      </div>
    </div>
  );
}