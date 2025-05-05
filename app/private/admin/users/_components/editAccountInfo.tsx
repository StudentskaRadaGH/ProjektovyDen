"use client";

import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import ServerActionButton from "@/components/utility/ServerActionButton";
import { SetState } from "@/lib/utilityTypes";
import { Switch } from "@/components/ui/switch";
import { User } from "@/lib/types";
import { configuration } from "@/configuration/configuration";
import { editUser } from "@/actions/user";
import { editUserSchema } from "@/validation/user";
import { getRoleIcon } from "@/configuration/roles";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useServerAction } from "@/hooks/use-server-action";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditAccountInfoProps {
    user: User;
    onOpenChange: SetState<boolean>;
    onSwitchEditScreen: SetState<"info" | "claimsAndAttendance">;
}

const EditAccountInfo = ({
    user,
    onOpenChange,
    onSwitchEditScreen,
}: EditAccountInfoProps) => {
    const { action: editAction, pending: editPending } = useServerAction({
        action: editUser,
        successToast: "Uživatel byl upraven úspěšně",
        errorToastTitle: "Uživatele se nepodařilo upravit",
        loadingToast: "Upravuji uživatele",
        onSuccess: () => onOpenChange(false),
    });

    const form = useForm<editUserSchema>({
        resolver: zodResolver(editUserSchema),
        values: {
            id: user.id,
            name: user.name,
            email: user.email,
            class: user.class ?? "none",
            isAttending: user.isAttending,
            isTeacher: user.isTeacher,
            isAdmin: user.isAdmin,
        },
    });

    useEffect(() => {
        resetForm();
    }, [user]);

    const resetForm = () => {
        form.reset({
            id: user.id,
            name: user.name,
            email: user.email,
            class: user.class ?? "none",
            isAttending: user.isAttending,
            isTeacher: user.isTeacher,
            isAdmin: user.isAdmin,
        });
    };

    const onSubmit = async (data: editUserSchema) => {
        await editAction(data);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Upravit uživatele</DialogTitle>
                <DialogDescription />
            </DialogHeader>
            <Form {...form}>
                <form
                    className="mb-auto"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="my-4">
                                <FormLabel>Jméno</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="my-4">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                            <FormItem className="my-4">
                                <FormLabel>Třída</FormLabel>
                                <FormControl>
                                    <ComboBox
                                        className="w-full"
                                        values={[
                                            {
                                                value: "none",
                                                label: "Žádná třída",
                                            },
                                            ...configuration.validClasses.map(
                                                (c) => ({
                                                    value: c,
                                                }),
                                            ),
                                        ]}
                                        placeholder="Vyberte třídu..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="mt-4 grid grid-cols-[1fr,auto] gap-4">
                        <FormField
                            control={form.control}
                            name="isAttending"
                            render={({ field }) => (
                                <FormItem className="col-span-2 grid grid-cols-subgrid items-center justify-start space-y-0">
                                    <FormLabel className="flex items-center gap-2">
                                        {getRoleIcon("attending")}
                                        Účastní se
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            className="mt-0"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isTeacher"
                            render={({ field }) => (
                                <FormItem className="col-span-2 grid grid-cols-subgrid items-center justify-start space-y-0">
                                    <FormLabel className="flex items-center gap-2">
                                        {getRoleIcon("teacher")}
                                        Učitel
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            className="mt-0"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isAdmin"
                            render={({ field }) => (
                                <FormItem className="col-span-2 grid grid-cols-subgrid items-center justify-start space-y-0">
                                    <FormLabel className="flex items-center gap-2">
                                        {getRoleIcon("admin")}
                                        Administrátor
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            className="mt-0"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
            <DialogFooter className="gap-4 sm:space-x-0">
                <Button
                    variant="outline"
                    onClick={() => onSwitchEditScreen("claimsAndAttendance")}
                >
                    {getRoleIcon("attending")}
                    Upravit volby přednášek
                </Button>
                <ServerActionButton
                    className="ml-8"
                    pending={editPending}
                    onClick={form.handleSubmit(onSubmit)}
                >
                    Uložit
                </ServerActionButton>
            </DialogFooter>
        </>
    );
};

export default EditAccountInfo;
