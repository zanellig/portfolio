"use client";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostPreview } from "./post-preview";

export default function Dashboard() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const uploadImage = useMutation({
    ...trpc.uploadImage.mutationOptions(),
    onSuccess: () => {
      toast.success("Image uploaded successfully!");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    },
  });

  const uploadPost = useMutation({
    ...trpc.postCreate.mutationOptions(),
    onSuccess: () => {
      toast.success("Post created as draft successfully");
    },
    onError: (e) => {
      toast.error(`${e.message}`);
    },
  });

  const imageForm = useForm({
    defaultValues: {
      file: null as File | null,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        toast.error("Please select an image to upload");
        return;
      }

      try {
        // Convert to FormData as expected by server
        const formData = new FormData();
        formData.append("file", value.file);

        uploadImage.mutate(formData);
      } catch (error) {
        // Error handling is already done in the mutation
        console.error("Upload failed:", error);
      }
    },
    validators: {
      onSubmit: z.object({
        file: z.instanceof(File).nullable(),
      }),
    },
  });

  type Post = typeof uploadPost.variables;
  const blankPost: Post = {
    body: "",
    slug: "",
    title: "",
    excerpt: undefined,
    format: "markdown",
    isCommentable: true,
    isFeatured: false,
    coverImageId: undefined,
  };

  const postValidationSchema = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(128, "Title must be 128 characters or less"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and dashes"
      ),
    body: z.string().min(1, "Body is required"),
    excerpt: z
      .string()
      .max(255, "Excerpt must be 255 characters or less")
      .optional(),
    format: z.enum(["markdown", "html"]),
    isCommentable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    coverImageId: z.string().nullable().optional(),
    meta: z.any().optional(),
  });

  const postForm = useForm({
    defaultValues: blankPost,
    onSubmit: async ({ value }) => {
      await uploadPost.mutateAsync({
        ...value,
        coverImageId: uploadImage.data ?? null,
      });
    },
    validators: {
      onSubmit: postValidationSchema,
    },
  });

  const handleTitleChange = (title: string) => {
    postForm.setFieldValue("title", title);

    // Auto-generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    postForm.setFieldValue("slug", slug);
  };

  const health = useQuery(trpc.healthCheck.queryOptions());

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

  if (isPending || !session) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">New post</h1>
        <p className="text-muted-foreground">Make a new post in the blog</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          imageForm.handleSubmit();
        }}
        className="space-y-4"
      >
        <Label htmlFor="file">Cover image</Label>
        <imageForm.Field
          name="file"
          children={(field) => (
            <ImageUpload
              value={field.state.value}
              onChange={(file) => field.handleChange(file)}
              error={field.state.meta.errors?.[0]?.toString()}
              disabled={uploadImage.isPending}
            />
          )}
        />

        <div className="space-x-4">
          <Button
            type="submit"
            disabled={uploadImage.isPending}
            className="min-w-[120px]"
          >
            {uploadImage.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => imageForm.reset()}
            disabled={uploadImage.isPending}
          >
            Clear
          </Button>
        </div>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          postForm.handleSubmit();
        }}
        className="space-y-4"
      >
        <postForm.Field
          name="title"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter the post title..."
                value={field.state.value || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              {field.state.meta.errors?.[0] && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </div>
          )}
        />
        <postForm.Field
          name="slug"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="post-url-slug"
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                className="font-mono"
              />
              {field.state.meta.errors?.[0] && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </div>
          )}
        />
        <postForm.Field
          name="excerpt"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Brief description of your post..."
                rows={2}
              />
            </div>
          )}
        />

        <Button type="submit" className="min-w-[120px]">
          Submit post
        </Button>
      </form>

      <postForm.Subscribe
        selector={(state) => ({
          format: state.values.format!,
          title: state.values.title,
          body: state.values.body,
        })}
        children={({ format, title, body }) => {
          const coverImageUrl = imageForm.state.values.file 
            ? URL.createObjectURL(imageForm.state.values.file)
            : undefined;
          
          return (
            <PostPreview 
              format={format} 
              title={title} 
              content={body}
              coverImageUrl={coverImageUrl}
            />
          );
        }}
      />

      <div className="space-y-2 p-4 rounded-md border-2 border-dashed bg-card">
        <h2 className="text-lg font-semibold tracking-tight">API Status</h2>
        <div className="flex gap-2 items-center">
          <div
            className={cn(
              health.isLoading
                ? "bg-amber-500 animate-pulse"
                : health.isSuccess
                ? "bg-green-500"
                : "bg-red-500 animate-pulse",
              "w-2 h-2 rounded-full"
            )}
          ></div>
          <p className="text-muted-foreground">
            {health.isLoading
              ? "Checking status..."
              : health.isSuccess
              ? "All systems operational"
              : JSON.stringify(health.error)}
          </p>
        </div>
      </div>
    </div>
  );
}
