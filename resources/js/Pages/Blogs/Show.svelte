<script>
    export let blog;
</script>

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
                    <a href="#" class="text-blue-500">Laravel</a>
                </li>
            </ul>
        </div>
    </article>
</div>
