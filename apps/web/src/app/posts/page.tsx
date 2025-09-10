import { caller } from "@/utils/server-trpc";

export default async function Blog() {
  const posts = await caller.posts();
  return (
    <>
      {posts?.map((i) => (
        <pre key={i.id}>{JSON.stringify(i)}</pre>
      ))}
    </>
  );
}
