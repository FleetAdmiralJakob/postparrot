"use client";
import { Input } from "~/app/_components/ui/input";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField } from "~/app/_components/ui/form";

const formSchema = z.object({
  query: z.string().min(1).max(100),
});

const Search = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/search?q=${values.query}`);
  }

  return (
    <Form {...form}>
      <form className="w-6/12 sm:w-auto" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormControl>
              <Input type="text" placeholder="Search..." {...field} />
            </FormControl>
          )}
        />
      </form>
    </Form>
  );
};

export default Search;
