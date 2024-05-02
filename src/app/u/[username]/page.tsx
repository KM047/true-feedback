"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import {  useState } from "react";
import { useCompletion } from "ai/react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";

const PublicPage = () => {
    const params = useParams<{ username: string }>();
    const username = params.username;

    const [sentMessage, setSentMessage] = useState("");
    // const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
    });

    const initialMessage =
        "What's your favorite movie? || Do you have any pets? || What's your dream job? ";

    const {
        complete,
        completion,
        isLoading: isSuggestLoading, // this is for the suggest message button
        error,
    } = useCompletion({
        api: "/api/suggest-messages",
        initialCompletion: initialMessage,
    });

    const handleClickMessage = (message: string) => {
        form.setValue("content", message);
    };

    const messageContent = form.watch("content");

    const suggestMessages = async () => {
        try {
            complete(""); // this function gets string argument
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: "Some things went wrong while fetching message",
                description:
                    axiosError.response?.data.message ||
                    "Failed to sending message",
                variant: "destructive",
            });
        }
    };

    const parseTheGeneratedMessage = (messageString: string): string[] => {
        return messageString.split("||");
    };

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse>(
                "/api/send-message",
                {
                    ...data,
                    username,
                }
            );

            if (response) {
                toast({
                    title: response.data.message,
                    variant: "default",
                });
            }

            form.reset({ ...form.getValues(), content: "" });
        } catch (error: any) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: "Some things went wrong while sending message",
                description:
                    axiosError.response?.data.message ||
                    "Failed to sending message",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
            <h1 className="text-4xl font-bold mb-6 text-center">
                Public Profile Link
            </h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 flex flex-col justify-center"
                >
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Send Anonymous Message to @{params.username}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write you anonymous message here."
                                        className="mb-4 resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                        {isLoading ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isLoading || !messageContent}
                            >
                                Send It
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            <div className="mt-4">
                <Button
                    disabled={isSuggestLoading}
                    onClick={() => suggestMessages()}
                >
                    Suggest Messages
                </Button>
                <h2 className="text-base my-2">
                    Click on any message below to select it.
                </h2>

                <div className="m-7 p-4 bg-white border-gray-300 border rounded-md">
                    <h2 className="text-xl font-bold mb-2">Messages</h2>

                    <div className="flex flex-col justify-center items-center my-4 gap-4">
                        {error ? (
                            <p>{error.message}</p>
                        ) : (
                            parseTheGeneratedMessage(completion).map(
                                (message: string, idx: any) => (
                                    <>
                                        <p
                                            className=" w-full p-2 mr-2 text-center font-medium border rounded-md hover:bg-slate-100 cursor-pointer"
                                            key={idx}
                                            onClick={() =>
                                                handleClickMessage(message)
                                            }
                                        >
                                            {message}
                                        </p>
                                    </>
                                )
                            )
                        )}
                    </div>
                </div>

                <div className="mb-4 flex flex-col justify-center items-center gap-3">
                    <p className="normal-case">Get Your Message Board</p>
                    <Button>Create your account</Button>
                </div>
            </div>
        </div>
    );
};

export default PublicPage;
