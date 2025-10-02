<script lang="ts">
	import { goto } from '$app/navigation';
	import LogoutButton from '$lib/component/logoutButton.svelte';
    import MainFooter from '$lib/island/mainFooter.svelte';
    let parentLogin: HTMLElement | null = null;
    let loginButton: HTMLElement | null = null;
    let signupButton: HTMLElement | null = null;

    function addHover() {
        parentLogin?.classList.add('bg-slate-200');
        signupButton?.classList.add('text-slate-200');
        parentLogin?.classList.remove('bg-white');
        signupButton?.classList.remove('text-white');
    }
    function removeHover() {
        parentLogin?.classList.add('bg-white');
        signupButton?.classList.add('text-white');
        parentLogin?.classList.remove('bg-slate-200');
        signupButton?.classList.remove('text-slate-200');
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

<section class="bg-white flex flex-col items-center justify-center nodrag relative">

    <!-- NAVIGATION -->
    <nav class="agerrlongercontainer z-50 flex sticky top-0 justify-between items-center pt-4 h-[60px] select-none">
        <a href="https://agerrstudio.com" class="button px-4 h-full flex justify-center items-center agerrborder bg-white hover:bg-slate-200">
            <div>Alur //</div>
            <div class="text-[10px] align-middle leading-[1.3] tracking-widest border-l border-slate-300 ml-2 pl-2">Organize All<br>Your Project</div>
        </a>
        <div class="flex space-x-2 h-full">
            <a href="https://zielalfino.agerrstudio.com" class="button flex justify-center items-center cursor-pointer px-5 h-full bg-white hover:bg-slate-200 rounded-lg agerrborder">Contact Me</a>
            <div bind:this={parentLogin} class="p-1 flex justify-center items-center agerrborder space-x-1 bg-white">
                <button bind:this={loginButton} on:click={() => goto("/login")} on:mouseenter={addHover} on:mouseleave={removeHover} on:focus={addFocus} on:blur={removeFocus} 
                class="cursor-pointer px-3 h-full rounded-lg">Log In</button>
                <button bind:this={signupButton} class="cursor-pointer agerrbggradient px-3 h-full rounded-lg font-bold text-white">Sign Up</button>
                <LogoutButton/>
            </div>
        </div>
    </nav>
    <!-- Toper Background Image -->
    <div class="absolute top-0 w-full bg-[url('/img/landingbackground.jpg')]
    h-[200px] bg-cover bg-[center_60%]
    mask-radial-farthest-corner mask-b-from-70% mask-radial-at-[50%_0%] mask-radial-from-30% mask-radial-to-80%"></div>

    <!-- HERO SECTION -->
    <main class="agerrcontainer z-1 select-none">
        <section class="flex flex-col justify-center items-center mt-[150px]">
            <h1 class="text-[76px] font-outfit font-bold tracking-tight leading-none mb-1">Find Your Flow.</h1>
            <p class="agerrp text-slate-700 text-center">See all your tasks at a glance with <b>simple</b>, and <b>clean</b> Kanban boards. <br> No more guessing what's next.</p>
            <button class="mt-6 mb-3 agerrbggradient text-2xl font-outfit font-semibold tracking-wide px-8 py-4 text-white cursor-pointer rounded-xl">Try now it's FREE!</button>
            <a href="https://zielalfino.com" tabindex="-1" class="text-xs text-slate-500 font-semibold hover:underline">It is Porfolio BTW.</a>
        </section>
    </main>

    <!-- SHOW UP CONTENT -->
    <section class="w-full h-[650px] relative flex justify-center">
        <!-- Backgound -->
        <div class="h-full w-full relative flex justify-center">
            <div class="absolute translate-x-[20vw] blur-[128px] h-180 w-128 rotate-45 bg-gradient-to-tl from-sky-200 to-purple-300"></div>
            <div class="absolute -translate-x-[15vw] top-16 blur-[128px] h-150 w-150 bg-gradient-to-tr rounded-full from-teal-200 to-purple-200"></div>
        </div>
        <!-- Image -->
        <div class="absolute -translate-x-[5vw] top-16 p-2 border border-white rounded-3xl bg-gradient-to-tl from-sky-100/50 to-purple-100/50 blur-xs
        mask-luminance mask-b-from-white mask-b-from-70% mask-b-to-black mask-b-to-100%">
            <div class="bg-white rounded-2xl w-[800px] h-[500px]"></div>
        </div>
        <!-- Card -->
        <div class="absolute translate-x-[25vw] p-2 border border-white rounded-2xl bg-gradient-to-tl from-sky-100/50 to-purple-100/50">
            <div class="bg-white agerrborder z-5 text-center p-4">
                <h2 class="agerrh2 mt-3">Choose your need</h2>
                <p class="tracking-wide text-slate-700 text-xs">i wont sell ur data, btw :) trust me</p>
                <div class="grid grid-cols-3 gap-3 w-full my-4">
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                    <button class="agerrtablebutton">
                        <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm"></div>
                        <div>test</div>
                        <div>test</div>
                    </button>
                </div>
                <button class="agerrbggradient border border-slate-300 rounded-lg py-4 w-full text-center text-base font-outfit font-semibold tracking-wide text-white cursor-pointer">
                    Lets Start
                </button>
            </div>
        </div>
    </section>

    <!-- FLEX -->
    <section class="w-full h-[200px] relative flex justify-center z-10">
        <!-- Erase Backgound -->
        <div class="absolute bg-white w-full h-96 z-10 -top-24 blur-3xl"></div>
        <!-- The Flex -->
        <section class="agerrlongercontainer z-15">
            <p class="agerrh4 text-[16px] text-center z-5 text-slate-500">Powering bussiness projects for certain company</p>
            <div class="h-16 flex items-center justify-center space-x-12 mask-x-from-80% mask-x-to-100% text-slate-500">
                <div class="text-5xl font-black font-eb">Vintage</div>
                <div class="text-5xl font-black font-open-sans">BrainEvo</div>
                <div class="text-5xl font-black font-eb">agerr.co</div>
                <div class="text-5xl font-black font-outfit italic">NEXTDOOR</div>
                <div class="text-5xl font-black font-coming">Comic</div>
            </div>
        </section>
    </section>

    <!-- FEATURE -->
    <section class="w-full h-[1350px] flex flex-col justify-center items-center bg-purple-50">    
        <!-- Cards -->
        <section class="agerrcontainer z-15 my-16 grid grid-cols-2 gap-2">
            <div class="relative w-full rounded-2xl border border-slate-200 p-8 h-[500px] bg-gradient-to-br from-sky-50 to-indigo-50 overflow-hidden">
                <div class="absolute w-full left-0 bottom-0 flex justify-center">
                    <div class="bg-sky-400 h-[360px] w-[calc(400px-4rem)] rounded-t-2xl drop-shadow-xl/30"></div>
                </div>
                <h2 class="agerrh2">Tired of the Chaos?</h2>
                <p class="agerrp text-slate-700 leading-normal align-middle">Trust me, u wont made it if <br> you not organize ur things.</p>
            </div>
            <div class="relative w-full rounded-2xl p-8 h-[500px] bg-gradient-to-br from-zinc-800 to-slate-900">
                <div class="absolute w-full left-0 bottom-0 flex justify-center">
                    <div class="bg-sky-400 h-[280px] w-[calc(400px-4rem)] rounded-t-2xl"></div>
                </div>
                <h2 class="agerrh2 text-white">Let's Organize It</h2>
                <p class="agerrp text-slate-300 leading-normal align-middle">With this website, let me help <br>you to organize your thing</p>
                <div class="flex items-center space-x-2 mt-6">
                    <button class="agerrbggradient rounded-lg py-2 px-3 text-base font-outfit font-semibold cursor-pointer">
                        Try it now it' free!
                    </button>
                    <div class="text-white text-xs">converge over 50+ <br> different apps</div>
                </div>
            </div>
        </section>

        <!-- Title Feature -->
        <section class="w-full relative flex justify-center z-10">
            <!-- Title  -->
            <section class="agerrlongercontainer z-15 flex flex-col justify-center items-center">
                <p class="agerrh4 text-[16px] text-center z-5 text-slate-500">Features</p>
                <h2 class="text-[32px] font-outfit font-bold tracking-tight leading-none mb-4 text-center">For now i dont think to make complex feature <br> beacuse its just FrontEnd portfolio</h2>
                <p class="agerrp text-slate-700 text-center">but who knows, idk tho if ill make feature in the future. but not for now.</p>
                <button class="my-4 agerrbggradient text-lg font-bebas font-semibold px-3 py-2 text-white cursor-pointer rounded-lg">Please try it :<div class="inline-block translate-y-[0.07em] ml-[0.025em] font-[600]">D</div></button>
            </section>
        </section>

        <!-- Box Feature -->
        <section class="agerrlongestcontainer space-x-12 mask-x-from-80% mask-x-to-100%
        grid grid-cols-10 gap-2 -translate-y-[50px]">
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-red-300 -top-16 rounded-full blur-3xl"></div>
                <div>test</div>
                <div>test</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-indigo-300 -top-16 rounded-full blur-3xl"></div>
                <div>test</div>
                <div>test</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-purple-300 -top-16 rounded-full blur-3xl"></div>
                <div>test</div>
                <div>test</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-pink-300 -top-16 rounded-full blur-3xl"></div>
                <div>test</div>
                <div>test</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <button aria-label="boxfeature" class="agerrboxfeature"></button>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
        </section>
    </section>
</section>

<!-- FOOTER -->
<MainFooter />