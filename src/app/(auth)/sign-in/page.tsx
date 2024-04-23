"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form } from "@/components/ui/form";

const Page = () => {
    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debouncedUsername = useDebounceValue(username, 300);

    const { toast } = useToast();

    const router = useRouter();

    // zod implementation

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        const checkUniqueUsername = async () => {
            if (debouncedUsername) {
                setIsCheckingUsername(true);

                setUsernameMessage("");

                try {
                    const response = await axios.get(
                        `/api/check-username-unique?username=${debouncedUsername}`
                    );

                    console.log(response);

                    setUsernameMessage(response.data.message);
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ??
                            "Error while checking username"
                    );
                } finally {
                    setIsCheckingUsername(false);
                }
            }
        };

        checkUniqueUsername();
    }, [debouncedUsername]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);

        try {
            console.log(data);

            const response = await axios.post<ApiResponse>(
                "/api/sign-up",
                data
            );

            toast({
                title: "Success",
                description: response.data.message,
            });

            router.replace(`/verify/${username}`);
        } catch (error) {
            console.error("Error while verifying username", error);

            const axiosError = error as AxiosError<ApiResponse>;

            let errorMessage = axiosError.response?.data.message;

            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            
        </div>
    );
};

export default Page;
