"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "./ui/use-toast";
import { Message } from "@/model/User.model";

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
};

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<ApiResponse>(
                `/api/delete-message/${message._id}`
            );

            toast({
                title: response.data.message,
            });

            onMessageDelete(message._id);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description:
                    axiosError.response?.data.message ??
                    "Failed to delete message",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <X className="w-5 h-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    );
}

export default MessageCard;
