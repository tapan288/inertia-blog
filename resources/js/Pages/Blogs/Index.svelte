<script>
    import { Link } from "@inertiajs/svelte";

    export let appName, blogs;
</script>

<div class="max-w-2xl mx-auto py-16">
    <Link
        href="#"
        class="inline-block text-2xl font-extrabold hover:text-blue-500 transition-colors duration-100"
    >
        {appName}
    </Link>
    <main class="mt-16">
        {#each blogs.data as blog}
            <div class="mb-10">
                <article class="prose">
                    <h1 class="not-prose">
                        <Link
                            href={route("blogs.show", blog.slug)}
                            class="hover:text-blue-500 transition-colors duration-100"
                        >
                            {blog.title}
                        </Link>
                    </h1>
                    <div>{blog.teaser}</div>
                </article>
                <div class="text-sm mt-10">
                    {blog.author} / {blog.created_at}
                    <ul
                        class="not-prose p-0 list-none flex items-center space-x-1 mt-2"
                    >
                        <li class="text-sm">
                            {#each blog.tags as tag}
                                <Link
                                    href={route("tags.show", tag.slug)}
                                    class="text-blue-500"
                                    >{tag.name}
                                </Link>
                            {/each}
                        </li>
                    </ul>
                </div>
            </div>
        {/each}
    </main>
</div>
