"use client";

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/model/User.model";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-separator";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { User } from "next-auth";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const { toast } = useToast();

    /**
     * IMP: Optimistic ui which is that it temporarily updates the user interface and after that it will send the request to the server
     */

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((m) => m._id !== messageId));
    };

    const { data: session } = useSession();

    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema),
    });

    const { register, watch, setValue } = form;

    const acceptMessages = watch("acceptMessages");

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const response = await axios.get<ApiResponse>(
                "/api/accept-messages"
            );

            setValue("acceptMessages", response.data.isAcceptingMessages);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: "Error",
                description:
                    axiosError.response?.data.message ||
                    "Failed to fetch messages settings",
                variant: "destructive",
            });
        } finally {
            setIsSwitchLoading(false);
        }
    }, [setValue, toast]);

    const fetchMessages = useCallback(
        async (refresh: boolean = false) => {
            setIsLoading(true);
            setIsSwitchLoading(false);
            try {
                const response = await axios.get<ApiResponse>(
                    "/api/get-messages"
                );
                setMessages(response.data.messages || []);
                if (refresh) {
                    toast({
                        title: "Refreshed Messages",
                        description: "Showing latest messages",
                    });
                }
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                toast({
                    title: "Error",
                    description:
                        axiosError.response?.data.message ??
                        "Failed to fetch messages",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
                setIsSwitchLoading(false);
            }
        },
        [setIsLoading, setMessages, toast]
    );

    useEffect(() => {
        if (!session || !session.user) return;
        fetchMessages();
        fetchAcceptMessage();
    }, [session, setValue, fetchAcceptMessage, fetchMessages]);

    // console.log("messages", messages);

    // handle switch change

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>(
                "/api/accept-messages",
                {
                    acceptMessages: !acceptMessages,
                }
            );

            setValue("acceptMessages", !acceptMessages);

            toast({
                title: response.data.message,
                variant: "default",
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: "Error",
                description:
                    axiosError.response?.data.message ||
                    "Failed handling switch",
                variant: "destructive",
            });
        }
    };

    const { username } = (session?.user as User) ?? "";
    // const { username } = session?.user as User;

    // console.log("session", session);

    // TODO: find the best and worst way to get the host url

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`;

    // console.log(profileUrl);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);

        toast({
            title: "Copy to clipboard",
            description: "Profile URL has been copied to clipboard",
        });
    };
    if (!session || !session.user) {
        return (
            <div className=" w-full h-[500px] flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">
                    Copy Your Unique Link
                </h2>{" "}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register("acceptMessages")}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? "On" : "Off"}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={message._id}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
