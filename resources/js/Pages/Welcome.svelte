<script>
    import { Link } from "@inertiajs/svelte";

    let name = "world";

    export let appName = "Laravel",
        posts;

    console.log(posts);
</script>

<svelte:head>
    <title>Your page title | {appName}</title>
    <meta name="description" content="Your page description" />
</svelte:head>

<div class="m-5">
    <form>
        <div class="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
            <div class="px-4 py-2 bg-white rounded-t-lg">
                <label for="comment" class="sr-only">Your comment</label>
                <textarea
                    id="comment"
                    rows="4"
                    class="w-full px-0 text-sm text-gray-900 bg-white"
                    placeholder="Write a comment..."
                    required
                />
            </div>
            <div class="flex items-center justify-between px-3 py-2 border-t">
                <button
                    type="submit"
                    class="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
                >
                    Post comment
                </button>
            </div>
        </div>
    </form>

    <ul>
        {#each posts as post}
            <li>
                {post.content}
            </li>
        {/each}
    </ul>
</div>
