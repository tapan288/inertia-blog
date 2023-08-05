<script>
    import { Link } from "@inertiajs/svelte";

    export let blog, appName;
</script>

<svelte:head>
    <title>{blog.data.title} | {appName}</title>
    <meta name="description" content={blog.data.teaser} />
</svelte:head>

<div class="max-w-2xl mx-auto py-16">
    <article class="prose prose-lg">
        <h1>{blog.data.title}</h1>
        <div>{@html blog.data.content}</div>
        <div class="text-sm mt-10">
            {blog.data.author} / {blog.data.created_at}
            <ul
                class="not-prose p-0 list-none flex items-center space-x-1 mt-2"
            >
                <li class="text-sm">
                    {#each blog.data.tags as tag}
                        <Link
                            href={route("tags.show", tag.slug)}
                            class="text-blue-500"
                            >{tag.name}
                        </Link>
                    {/each}
                </li>
            </ul>
        </div>
    </article>
</div>
