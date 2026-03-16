"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
    followerClerkId: string;
    followedClerkId: string;
    initialIsFollowing: boolean;
}

const FollowButton = ({
    followerClerkId,
    followedClerkId,
    initialIsFollowing,
}: FollowButtonProps) => {
    const [isPending, startTransition] = useTransition();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    const handleToggleFollow = async () => {
        if (!followerClerkId) {
            toast.error("Please sign in to follow users.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await toggleFollow(followerClerkId, followedClerkId);
                if (result.success) {
                    setIsFollowing(result.isFollowing!);
                    toast.success(result.isFollowing ? "Followed successfully!" : "Unfollowed.");
                } else {
                    toast.error(result.error || "Failed to toggle follow.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        });
    };

    return (
        <Button
            onClick={handleToggleFollow}
            disabled={isPending}
            variant={isFollowing ? "outline" : "default"}
            className={cn(
                "rounded-full gap-2 font-bold transition-all active:scale-95 px-6 py-5",
                isFollowing 
                    ? "border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/5" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
            )}
        >
            {isPending ? (
                <Loader2 className="size-4 animate-spin" />
            ) : isFollowing ? (
                <UserMinus className="size-4" />
            ) : (
                <UserPlus className="size-4" />
            )}
            {isFollowing ? "Following" : "Follow"}
        </Button>
    );
};

export default FollowButton;
