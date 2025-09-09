"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React from "react";

export default function Blog() {
  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery(trpc.posts.queryOptions());

  const { mutateAsync } = useMutation(trpc.postCreate.mutationOptions());

  const [count, setCount] = React.useState(0);

  if (isLoading) return <div>Loading posts...</div>;

  return (
    <section className="container max-w-3xl px-20 py-8 flex flex-col gap-4">
      <Button
        className="flex gap-2 w-28"
        onClick={async () => {
          await mutateAsync({ title: String(count) });
          refetch();
          setCount(count + 1);
        }}
      >
        Add post
        <Plus />
      </Button>
      {posts?.map((i) => (
        <pre key={i.id}>{JSON.stringify(i)}</pre>
      ))}
    </section>
  );
}
