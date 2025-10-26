<script lang="ts">
	// import { goto } from '$app/navigation';
	// import LogoutButton from '$lib/component/logoutButton.svelte';
    import MainFooter from '$lib/island/mainFooter.svelte';
	// import Login from './login.svelte';

    // import { isLoginModalOpen, isSigningUpMode } from '$lib/stores/uiStore';
	// import { fade } from 'svelte/transition';
    // import { quadOut } from 'svelte/easing';
	import MainNav from './mainNav.svelte';

    import { isLoginModalOpen, isSigningUpMode } from '$lib/stores/uiStore';
	import { fade } from 'svelte/transition';
	import { quadOut } from 'svelte/easing';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
    function openSigninModal() {
        isSigningUpMode.set(true); 
        if (isPhone) {
            isLoginModalOpen.set(true); 
        } else {
            goto('/login')
        }
    }

    let localcard:number = $state(0)

    let value1:boolean = $state(false)
    let value2:boolean = $state(false)
    let value3:boolean = $state(false)
    let value4:boolean = $state(false)
    let value5:boolean = $state(false)
    let value6:boolean = $state(false)
    let value7:boolean = $state(false)
    let value8:boolean = $state(false)
    let value9:boolean = $state(false)
    
	let isReadPhone = $state(false);
    let isPhone = $state(false);
	let isTablet = $state(false);
	let isLaptop = $state(false);
	function checkWidth() {
		isReadPhone = window.matchMedia("(max-width: 500px)").matches;
        isPhone = window.matchMedia("(min-width: 500px)").matches;
		isTablet = window.matchMedia("(min-width: 700px)").matches;
		isLaptop = window.matchMedia("(min-width: 900px)").matches;
	}

	onMount(() => {
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	});
    
	// $effect(() => {
	// 	if (isTablet) {
	// 		button1value = true;
	// 		button2value = true;
	// 		button3value = true;
	// 	} else {
	// 		button1value = true;
	// 		button2value = false;
	// 		button3value = false;
	// 	}
	// });
</script>

<style>
	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	.animate-marquee {
		animation: marquee 15s linear infinite;
	}
</style>

<main class="bg-white flex flex-col items-center justify-center nodrag relative overflow-hidden">

    <MainNav />
    
    <!-- TOPER BACKGROUND -->
    <div class="absolute top-0 w-full bg-[url('/img/landingbackground.jpg')] h-[200px] bg-cover bg-[center_60%]
    mask-radial-farthest-corner mask-b-from-70% mask-radial-at-[50%_0%] mask-radial-from-30% mask-radial-to-80%"></div>


    <!-- HERO SECTION -->
    <main class="agerrcontainer z-1 select-none py-[15vh] phone:pt-16 phone:pb-32 tablet:py-16">
        <section class="flex flex-col justify-center items-center mt-[150px]">
            <h1 class="text-4xl phone:text-6xl tablet:text-[76px] font-outfit font-bold tracking-tight leading-none mb-1">Find Your Flow.</h1>
            <p class="tracking-wide text-xs tablet:text-base text-slate-700 text-center">
                See all your tasks at a glance with <b>simple</b>,<br class="phone:hidden"> and <b>clean</b> Kanban boards. <br> 
                <span class="hidden phone:block">No more guessing what's next.</span>
            </p>
            <button class="button mt-6 mb-3 agerrbggradient text-base phone:text-xl tablet:text-2xl font-outfit font-semibold tracking-wide px-4 tablet:px-8 py-3 tablet:py-4 text-white cursor-pointer rounded-lg tablet:rounded-xl" 
                onclick={openSigninModal}>Try now it's FREE!</button>
            <a href="https://zielalfino.com" tabindex="-1" class="max-phone:hidden text-xs text-slate-500 font-semibold hover:underline">It is Porfolio BTW.</a>
        </section>
    </main>



    <!-- SHOW UP CONTENT -->
    <section class="w-full h-[600px] phone:h-[500px] tablet:h-[650px] relative flex justify-center">
        
        <!-- Gradient Backgound -->
        <div class="h-full w-full relative flex justify-center">
            <div class="absolute translate-x-[20vw] blur-[128px] h-180 w-128 rotate-45 bg-gradient-to-tl from-sky-200 to-purple-300"></div>
            <div class="absolute -translate-x-[15vw] top-16 blur-[128px] h-150 w-150 bg-gradient-to-tr rounded-full from-teal-200 to-purple-200"></div>
        </div>

        <!-- FEATURE -->
        {#if isTablet}
            <!-- Image -->
            <div class="absolute -translate-x-[5vw] top-32 tablet:top-24 laptop:top-16 p-2 border-1 border-white rounded-3xl bg-gradient-to-tl from-sky-100/50 to-purple-100/50
            mask-luminance mask-b-from-white mask-b-from-70% mask-b-to-black mask-b-to-100%">
                <div class="w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5] relative">
                    {#if localcard === 0}
                        <img src="https://placehold.co/700x400?text=Ini+Bukan+Template" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 1}
                        <enhanced:img src="$lib/assets/cardimg/cc3e5d90.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 2}
                        <enhanced:img src="$lib/assets/cardimg/6N0BXf2.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 3}
                        <enhanced:img src="$lib/assets/cardimg/ZePLSCW.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 4}
                        <enhanced:img src="$lib/assets/cardimg/wQAul6y.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 5}
                        <enhanced:img src="$lib/assets/cardimg/MYLIq7U.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 6}
                        <enhanced:img src="$lib/assets/cardimg/er5QHYU.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 7}
                        <enhanced:img src="$lib/assets/cardimg/BCw3R2V.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 8}
                        <enhanced:img src="$lib/assets/cardimg/394b52e0.png" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {:else if localcard === 9}
                        <enhanced:img src="$lib/assets/cardimg/0kTFlR5.jpeg" alt="card show img" transition:fade={{duration: 300}} class="object-cover absolute top-0 left-0 bg-white rounded-2xl w-[400px] tablet:w-[550px] laptop:w-[700px] desktop:w-[800px] aspect-[8/5]" />
                    {/if}
                </div>
            </div>

            <!-- Card -->
            <div class="absolute translate-x-[25vw] p-2 border-1 border-white rounded-2xl bg-gradient-to-tl from-sky-100/50 to-purple-100/50">
                <div class="bg-white agerrborder z-5 text-center p-4">
                    <h2 class="text-2xl laptop:text-[32px] font-outfit font-bold leading-none mb-2 mt-3">Choose your need</h2>
                    <p class="tracking-wide text-slate-700 text-[10px] laptop:text-xs">i wont sell ur data, btw :) trust me</p>
                    <div class="grid grid-cols-3 gap-3 w-full my-4">
                        <button onclick={() => {localcard = 1; value1 = !value1}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value1 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:list-check-2-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Task</div>
                        </button>
                        <button onclick={() => {localcard = 2; value2 = !value2}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value2 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:dashboard-2-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Dashboard</div>
                        </button>
                        <button onclick={() => {localcard = 3; value3 = !value3}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value3 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:align-top-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Kanban</div>
                        </button>
                        <button onclick={() => {localcard = 4; value4 = !value4}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value4 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:alarm-1-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Reminder</div>
                        </button>
                        <button onclick={() => {localcard = 5; value5 = !value5}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value5 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:pig-money-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Saving</div>
                        </button>
                        <button onclick={() => {localcard = 6; value6 = !value6}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value6 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:bank-card-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Outcome</div>
                        </button>
                        <button onclick={() => {localcard = 7; value7 = !value7}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value7 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:black-board-2-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Whiteboard</div>
                        </button>
                        <button onclick={() => {localcard = 8; value8 = !value8}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value8 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:clipboard-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Notes</div>
                        </button>
                        <button onclick={() => {localcard = 9; value9 = !value9}} class="tablebutton">
                            <div class="absolute top-1.5 right-1.5 ring-1 ring-slate-300 w-4 aspect-square rounded-sm flex justify-center items-center">
                                <div class="absolute {value9 ? '' : 'hidden '}">
                                    <Icon icon="mingcute:check-2-fill" />
                                </div>
                            </div>
                            <div class="text-3xl flex justify-center text-slate-300"><Icon icon="mingcute:book-2-fill"/></div>
                            <div class="text-[10px] laptop:text-xs">Journal</div>
                        </button>
                    </div>
                    <button onclick={openSigninModal} class="agerrbggradient button border border-slate-300 rounded-lg py-4 w-full text-center text-base font-outfit font-semibold tracking-wide text-white cursor-pointer">
                        Lets Start
                    </button>
                </div>
            </div>
        {/if}

        {#if !isTablet}
            <div class="absolute w-[90%] max-w-[500px]">
                <div class="absolute z-10 w-full -top-6 text-2xl font-outfit font-bold flex justify-center ">
                    <div class="drop-shadow-lg w-fit p-1.5 border-1 border-white rounded-lg bg-gradient-to-tl from-sky-100/50 to-purple-100/50">
                        <div class="w-full bg-white rounded-md px-3 py-1">
                            Features
                        </div>
                    </div>
                </div>
                <div class="p-2 border-1 border-white rounded-3xl bg-gradient-to-tl from-sky-100/50 to-purple-100/50
                mask-luminance mask-b-from-white mask-b-from-50% mask-b-to-black mask-b-to-95%">
                    <div class="w-full grid grid-cols-3 phone:grid-cols-4 gap-4 p-8 bg-white rounded-2xl font-bold">
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-rose-400"><Icon icon="mingcute:clipboard-fill"/></div>
                            <div class="text-xs capitalize">Notes</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-amber-400"><Icon icon="mingcute:pig-money-fill"/></div>
                            <div class="text-xs capitalize">Saving</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-cyan-400"><Icon icon="mingcute:book-2-fill"/></div>
                            <div class="text-xs capitalize">Books</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-purple-400"><Icon icon="mingcute:black-board-2-fill"/></div>
                            <div class="text-xs capitalize">Boards</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-sky-400"><Icon icon="mingcute:dashboard-fill"/></div>
                            <div class="text-xs capitalize">Dashboard</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-emerald-400"><Icon icon="mingcute:calendar-fill"/></div>
                            <div class="text-xs capitalize">Calendar</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-zinc-700"><Icon icon="mingcute:align-left-2-fill"/></div>
                            <div class="text-xs capitalize">Kanban</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-orange-400"><Icon icon="mingcute:alarm-1-fill"/></div>
                            <div class="text-xs capitalize">Reminder</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-pink-400"><Icon icon="mingcute:file-code-fill"/></div>
                            <div class="text-xs capitalize">Code</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-blue-400"><Icon icon="mingcute:gift-fill"/></div>
                            <div class="text-xs capitalize">Gift</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-rose-400"><Icon icon="mingcute:save-2-fill"/></div>
                            <div class="text-xs capitalize">Double</div>
                        </div>
                        <div class="flex justify-center items-center flex-col aspect-square">
                            <div class="text-5xl mb-2 text-slate-600"><Icon icon="mingcute:terminal-box-fill"/></div>
                            <div class="text-xs capitalize">Terminal</div>
                        </div>
                    </div>
                </div>
                <div class="w-full flex justify-center items-center -translate-y-12">
                    <div class="text-base font-outfit font-semibold tracking-wide px-4 py-3 text-slate-800">
                        and much more...
                    </div>
                </div>
            </div>
        {/if}

    </section>



    <!-- FLEX -->
    <section class="w-full h-[200px] relative flex justify-center z-10 opacity-90">
        <!-- Erase Backgound -->
        <div class="absolute bg-white w-full h-128 phone:h-96 z-11 -top-40 phone:-top-24 phone:blur-3xl max-phone:mask-t-from-70% max-phone:mask-t-to-90%"></div>
        <!-- The Flex -->
        <section class="agerrlongercontainer z-15">
            <p class="agerrh4 text-[16px] text-center z-5 text-slate-500">Powering bussiness projects <br class="phone:hidden"> for certain company</p>
            <div class="mask-x-from-80% mask-x-to-100%">
                <div class="animate-marquee flex w-fit">
                    <div class="h-16 flex items-center justify-between font-black text-3xl tablet:text-5xl min-w-[800px] tablet:min-w-[1200px] pr-12 text-slate-500">
                        <div class="font-eb">Vintage</div>
                        <div class="font-open-sans">BrainEvo</div>
                        <div class="font-eb">agerr.co</div>
                        <div class="font-outfit italic">NEXTDOOR</div>
                        <div class="font-coming">Comic</div>
                    </div>
                    <div class="h-16 flex items-center justify-between font-black  text-3xl tablet:text-5xl min-w-[800px] tablet:min-w-[1200px] pr-12 text-slate-500">
                        <div class="font-eb">Vintage</div>
                        <div class="font-open-sans">BrainEvo</div>
                        <div class="font-eb">agerr.co</div>
                        <div class="font-outfit italic">NEXTDOOR</div>
                        <div class="font-coming">Comic</div>
                    </div>
                </div>
            </div>
        </section>
    </section>

    <!-- FEATURE -->
    <section class="relative w-full laptop:min-h-[1350px] flex flex-col justify-center items-center bg-white phone:bg-purple-50"> 
        <div class="absolute w-full h-12 bg-purple-50 top-0 mask-t-to-70% mask-t-from-0%">test</div>
        <!-- Cards -->
        <section class="w-full laptop:  max-w-[800px] z-15 mb-16 phone:mt-16 flex flex-col justify-center items-center tablet:flex-row gap-8 laptop:grid laptop:grid-cols-2">
            <div class="relative w-full max-w-[300px] phone:max-w-[400px] tablet:max-w-[300px] laptop:max-w-[400px] rounded-2xl border border-slate-200 p-8 aspect-[4/5] bg-gradient-to-br from-sky-50 to-indigo-50 overflow-hidden">
                <div class="absolute w-full left-0 bottom-0 flex justify-center">
                    <div class="bg-sky-400 aspect-[5/5] w-[calc(300px-4rem)] phone:w-[calc(400px-4rem)] tablet:w-[calc(300px-4rem)] laptop:w-[calc(400px-4rem)] rounded-t-2xl drop-shadow-xl/30"></div>
                </div>
                <h2 class="text-2xl laptop:text-[32px] font-outfit font-bold leading-none mb-2">Tired of the Chaos?</h2>
                <p class="tracking-wide text-sm phone:text-base tablet:text-sm laptop:text-base text-slate-700 leading-normal align-middle">Trust me, u wont made it if <br> you not organize ur things.</p>
            </div>
            <div class="relative w-full max-w-[300px] phone:max-w-[400px] tablet:max-w-[300px] laptop:max-w-[400px] rounded-2xl p-8 aspect-[4/5] bg-gradient-to-br from-zinc-800 to-slate-900">
                <div class="absolute w-full left-0 bottom-0 flex justify-center">
                    <div class="bg-sky-400 aspect-[5/4] w-[calc(300px-4rem)] phone:w-[calc(400px-4rem)] tablet:w-[calc(300px-4rem)] laptop:w-[calc(400px-4rem)] rounded-t-2xl"></div>
                </div>
                <h2 class="text-2xl laptop:text-[32px] font-outfit font-bold leading-none mb-2 text-white">Let's Organize It</h2>
                <p class="tracking-wide text-sm phone:text-base tablet:text-sm laptop:text-base text-slate-300 leading-normal align-middle">With this website, let me help <br>you to organize your thing</p>
                <div class="flex items-center space-x-2 mt-6">
                    <button onclick={openSigninModal} class="agerrbggradient button rounded-lg py-2 px-3 text-sm phone:text-base tablet:text-sm laptop:text-base font-outfit font-semibold cursor-pointer">
                        Try it now it' free!
                    </button>
                    <div class="text-white text-[10px] phone:text-xs tablet:text-[10px] laptop:text-xs">converge over 50+ <br> different apps</div>
                </div>
            </div>
        </section>

        <!-- Title Feature -->
        <section class="w-full relative flex justify-center z-10 max-tablet:mb-16">
            <!-- Title  -->
            <section class="agerrlongercontainer z-15 flex flex-col justify-center items-center">
                <p class="agerrh4 text-[16px] text-center z-5 text-slate-500">Features</p>
                <h2 class="text-2xl tablet:text-[32px] font-outfit font-bold tracking-tight leading-none mb-4 text-center">For now i dont think to <br class="phone:hidden"> make complex feature <br> beacuse its just portfolio</h2>
                <p class="text-xs tablet:text-base tracking-wide text-slate-700 text-center">but who knows, idk tho if ill make feature <br class="phone:hidden"> in the future. but not for now.</p>
                <button onclick={openSigninModal} class="my-4 button agerrbggradient text-lg font-outfit px-3 py-2 font-semibold text-white cursor-pointer rounded-lg">Please try it :<div class="inline-block translate-y-[0.07em] ml-[0.025em] font-bebas font-medium">0</div></button>
            </section>
        </section>

        <!-- Box Feature -->
        <section class="agerrlongestcontainer space-x-12 mask-x-from-80% mask-x-to-100% font-bold
        grid grid-cols-4 phone:grid-cols-6 tablet:grid-cols-8 laptop:grid-cols-10 gap-2 max-tablet:py-2 tablet:translate-y-[50px]">
            {#if isTablet}
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                {#if isLaptop}
                    <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                    <div aria-label="boxfeature" class="agerrnonboxfeature mask-t-from-0% mask-t-to-50%"></div>
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:bookmarks-simple-duotone"/></div>
                        <div class="text-xs capitalize">Bookmark</div>
                    </button>
                {/if}
                <button aria-label="boxfeature" class="agerrboxfeature">
                    <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:newspaper-clipping-duotone"/></div>
                    <div class="text-xs capitalize">Newspaper</div>
                </button>
            {/if}
            <button aria-label="boxfeature" class="agerrboxfeature">
                <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:chart-line-up-duotone"/></div>
                <div class="text-xs capitalize">Cart</div>
            </button>
            {#if isReadPhone}
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:newspaper-clipping-duotone"/></div>
                        <div class="text-xs capitalize">Newspaper</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:money-wavy-duotone"/></div>
                        <div class="text-xs capitalize">Economy</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:chalkboard-simple-duotone"/></div>
                        <div class="text-xs capitalize">Whiteboard</div>
                    </button>
            {/if}
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-rose-300 -top-16 rounded-full blur-3xl"></div>
                <div class="text-8xl mb-2 text-rose-400"><Icon icon="ph:align-top-duotone"/></div>
                <div class="text-lg capitalize text-rose-400">Kanban</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-indigo-300 -top-16 rounded-full blur-3xl"></div>
                <div class="text-8xl mb-2 text-indigo-400"><Icon icon="ph:list-checks-duotone"/></div>
                <div class="text-lg capitalize text-indigo-400">Checkklist</div>
            </button>
            {#if isTablet}
                <button aria-label="boxfeature" class="agerrboxfeature">
                    <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:chalkboard-simple-duotone"/></div>
                    <div class="text-xs capitalize">Whiteboard</div>
                </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                    <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:money-wavy-duotone"/></div>
                    <div class="text-xs capitalize">Economy</div>
                </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                    <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:airplane-duotone"/></div>
                    <div class="text-xs capitalize">Offline Mode</div>
                </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                    <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:lock-laminated-open-duotone"/></div>
                    <div class="text-xs capitalize">Locked</div>
                </button>
                {#if isLaptop}
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:pencil-simple-duotone"/></div>
                        <div class="text-xs capitalize">Edit</div>
                    </button>
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:clipboard-text-duotone"/></div>
                        <div class="text-xs capitalize">Clipboard</div>
                    </button>
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:airplay-duotone"/></div>
                        <div class="text-xs capitalize">Airplay</div>
                    </button>
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:alien-duotone"/></div>
                        <div class="text-xs capitalize">Alien</div>
                    </button>                
                {/if}
            {/if}
            {#if isPhone}
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:android-logo-duotone"/></div>
                        <div class="text-xs capitalize">Android</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:briefcase-duotone"/></div>
                        <div class="text-xs capitalize">Work</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:calendar-dots-duotone"/></div>
                        <div class="text-xs capitalize">Calendar</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:cat-duotone"/></div>
                        <div class="text-xs capitalize">Cat</div>
                    </button>
            {/if}
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-purple-300 -top-16 rounded-full blur-3xl"></div>
                <div class="text-8xl mb-2 text-purple-500"><Icon icon="ph:envelope-duotone"/></div>
                <div class="text-lg capitalize text-purple-500">Invite User</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature col-span-2 row-span-2 relative overflow-hidden">
                <div class="absolute w-24 h-24 bg-pink-300 -top-16 rounded-full blur-3xl"></div>
                <div class="text-8xl mb-2 text-pink-500"><Icon icon="ph:clipboard-text-duotone"/></div>
                <div class="text-lg capitalize text-pink-500">Share Board</div>
            </button>
            <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:paper-plane-right-duotone"/></div>
                        <div class="text-xs capitalize">Messages</div>
                    </button>
            <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:push-pin-duotone"/></div>
                        <div class="text-xs capitalize">Pinned</div>
                    </button>
            <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:clipboard-text-duotone"/></div>
                        <div class="text-xs capitalize">Form</div>
                    </button>
            {#if isReadPhone}
                <button aria-label="boxfeature" class="agerrboxfeature">
                    <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:airplane-duotone"/></div>
                    <div class="text-xs capitalize">Offline Mode</div>
                </button>
            {/if}
            {#if isTablet}
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:drop-duotone"/></div>
                        <div class="text-xs capitalize">Drop</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:eye-duotone"/></div>
                        <div class="text-xs capitalize">Invisible</div>
                    </button>
                <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:fast-forward-duotone"/></div>
                        <div class="text-xs capitalize">Fast Forward</div>
                    </button>
                {#if isLaptop}
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:globe-simple-duotone"/></div>
                        <div class="text-xs capitalize">Website</div>
                    </button>
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:taxi-duotone"/></div>
                        <div class="text-xs capitalize">Taxi</div>
                    </button>
                    <button aria-label="boxfeature" class="agerrboxfeature">
                        <div class="text-5xl mb-2 text-slate-600"><Icon icon="ph:volleyball-duotone"/></div>
                        <div class="text-xs capitalize">Volley</div>
                    </button>                
                    <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                    <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                {/if}
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
                <div aria-label="boxfeature" class="agerrnonboxfeature mask-b-from-0% mask-b-to-50%"></div>
            {/if}
        </section>
    </section>
</main>

<!-- FOOTER -->
<MainFooter />