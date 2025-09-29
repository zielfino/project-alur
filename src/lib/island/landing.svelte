<script lang="ts">
    let parentLogin: HTMLElement | null = null;
    let loginButton: HTMLElement | null = null;
    let signupButton: HTMLElement | null = null;

    function addHover() {
        parentLogin?.classList.add('bg-zinc-200');
        signupButton?.classList.add('text-zinc-200');
        parentLogin?.classList.remove('bg-white');
        signupButton?.classList.remove('text-white');
    }
    function removeHover() {
        parentLogin?.classList.add('bg-white');
        signupButton?.classList.add('text-white');
        parentLogin?.classList.remove('bg-zinc-200');
        signupButton?.classList.remove('text-zinc-200');
    }

    function addFocus() {
        parentLogin?.classList.add('bg-sky-100');
        signupButton?.classList.add('text-sky-100');
        parentLogin?.classList.remove('bg-white');
        signupButton?.classList.remove('text-white');
    }
    function removeFocus() {
        parentLogin?.classList.add('bg-white');
        signupButton?.classList.add('text-white');
        parentLogin?.classList.remove('bg-sky-100');
        signupButton?.classList.remove('text-sky-100');
    }
</script>

<section class="bg-white flex flex-col items-center justify-center nodrag">
    <nav class="w-full max-w-[800px] z-50 flex sticky top-0 justify-between items-center pt-4 h-[60px] select-none">
        <a href="https://agerrstudio.com" class="px-4 h-full flex justify-center items-center agerrborder bg-white hover:bg-zinc-200">
            <div>Alur //</div>
            <div class="text-[10px] align-middle leading-[1.3] tracking-widest border-l border-zinc-300 ml-2 pl-2">Organize All<br>Your Project</div>
        </a>
        <div class="flex space-x-2 h-full">
            <a href="https://zielalfino.agerrstudio.com" class="flex justify-center items-center cursor-pointer px-5 h-full bg-white hover:bg-zinc-200 rounded-lg agerrborder">Contact Me</a>
            <div bind:this={parentLogin} class="p-1 flex justify-center items-center agerrborder space-x-1 bg-white">
                <button bind:this={loginButton} on:mouseenter={addHover} on:mouseleave={removeHover} on:focus={addFocus} on:blur={removeFocus} 
                class="cursor-pointer px-3 h-full rounded-lg">Log In</button>
                <button bind:this={signupButton} class="cursor-pointer agerrbggradient px-3 h-full rounded-lg font-bold text-white">Sign Up</button>
            </div>
        </div>
    </nav>
    <div class="absolute top-0 w-full bg-[url('/img/landingbackground.jpg')]
    h-[200px] bg-cover bg-[center_60%]
    mask-radial-farthest-corner mask-b-from-70% mask-radial-at-[50%_0%] mask-radial-from-30% mask-radial-to-80%"></div>
    <main class="w-full max-w-[800px] z-1 select-none">
        <section class="flex flex-col justify-center items-center mt-[150px]">
            <h1 class="text-[76px] font-outfit font-bold tracking-tight leading-none mb-1">Find Your Flow.</h1>
            <p class="tracking-wide text-zinc-700 text-base text-center">See all your tasks at a glance with <b>simple</b>, and <b>clean</b> Kanban boards. <br> No more guessing what's next.</p>
            <button class="mt-6 mb-3 agerrbggradient text-2xl font-outfit font-semibold tracking-wide px-8 py-4 text-white cursor-pointer rounded-xl">Try now it's FREE!</button>
            <a href="https://zielalfino.com" tabindex="-1" class="text-xs text-zinc-500 font-semibold hover:underline">Is it Porfolio BTW.</a>
        </section>
    </main>
    <section class="flex flex-col justify-center items-center h-screen bg-red-50 w-full">
        
    </section>
</section>