<script>
    import { Link } from "@inertiajs/svelte";

    let name = "world";

    export let appName = "Laravel";
</script>

<svelte:head>
    <title>Your page title | {appName}</title>
    <meta name="description" content="Your page description" />
</svelte:head>

<h1>Hello {name}!</h1>
<Link href={route("home")}>Home</Link>
