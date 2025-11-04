<script lang="ts">
	import Logosvg from "$lib/assets/logosvg.svelte";
	import Icon from "@iconify/svelte";
	import { slide } from "svelte/transition";
    import { quadOut } from 'svelte/easing';
	import { onMount } from "svelte";

    const year = new Date().getFullYear();

    let button1: HTMLElement | null = null;
    let button2: HTMLElement | null = null;
    let button3: HTMLElement | null = null;

    let button1value: boolean = $state(true)
    let button2value: boolean = $state(false)
    let button3value: boolean = $state(false)

	let isTablet = $state(false);
	function checkWidth() {
		isTablet = window.matchMedia("(min-width: 700px)").matches;
	}

	onMount(() => {
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	});
    
	$effect(() => {
		if (isTablet) {
			button1value = true;
			button2value = true;
			button3value = true;
		} else {
			button1value = true;
			button2value = false;
			button3value = false;
		}
	});
</script>

<footer>

    <!-- HEAD -->
    <div class="fullwiddhcover">
        <div class="container text flex items-center">

            <!-- LOGO -->
            <div class="w-24 pr-4 mr-4 border-e border-slate-300">
                <Logosvg />
            </div>

            <!-- TAGLINE -->
            <div class="">
                Organize your project,<br class="phone:hidden"> find your own flow.
            </div>

        </div>
    </div>

    <!-- CONTENT -->
    <div class="container text pt-6 phone:pt-4 laptop:pt-8">

        <!-- LINKS -->
        <div class="links">

            <!-- DROPDOWN -->
            <div class="link">
                <button class="title" disabled={isTablet} bind:this={button2} onclick={() => { if (!isTablet) button2value = !button2value}}>
                    More From agerr <div class="tablet:hidden transition-transform duration-300 ease-out {button2value ? 'rotate-180' : ''}"><Icon icon="mingcute:down-fill"/></div>
                </button>
                {#if button2value}
                    <ul transition:slide={{ duration: 300, easing: quadOut }}>
                        <li><a href="https://agerrstudio.com"><div class="max-tablet:w-full">agerr.studio</div></a></li>
                        <li>agerr.blog</li>
                        <li>agerr.store</li>
                        <li>NECOFE</li>
                        <li><a href="https://kasatara.agerrstudio.com"><div class="max-tablet:w-full">KASATARA</div></a></li>
                    </ul>
                {/if}
            </div>
            <div class="link">
                <button class="title" disabled={isTablet} bind:this={button1} onclick={() => { if (!isTablet) button1value = !button1value}}>
                    Product <div class="tablet:hidden transition-transform duration-300 ease-out {button1value ? 'rotate-180' : ''}"><Icon icon="mingcute:down-fill"/></div>
                </button>
                {#if button1value}
                    <ul transition:slide={{ duration: 300, easing: quadOut }}>
                        <li>What is Alur?</li>
                        <li>The Feature</li>
                        <li>Documentation</li>
                        <li>Whats Comming</li>
                    </ul>
                {/if}
            </div>
            <div class="link">
                <button class="title" disabled={isTablet} bind:this={button3} onclick={() => { if (!isTablet) button3value = !button3value}}>
                    Get in Touch <div class="tablet:hidden transition-transform duration-300 ease-out {button3value ? 'rotate-180' : ''}"><Icon icon="mingcute:down-fill"/></div>
                </button>
                {#if button3value}
                    <ul transition:slide={{ duration: 300, easing: quadOut }}>
                        <li><a href="https://zielalfino.com/"><div class="max-tablet:w-full">Contact</div></a></li>
                        <li>Support</li>
                        <li>Partners</li>
                    </ul>
                {/if}
            </div>

            <!-- WITH LOGO -->
            <div class="link max-tablet:flex max-tablet:justify-center">
                <div class="max-tablet:hidden"><h4 class="title">Connect <div class="tablet:hidden"><Icon icon="mingcute:down-fill"/></div></h4></div>
                <div class="grid grid-cols-6 tablet:grid-cols-3 text-3xl tablet:text-2xl gap-5 w-fit transition-all duration-300 {button3value ? 'max-tablet:mt-1' : 'max-tablet:mt-8'}">
                    <a href="https://www.instagram.com/zielfino" class="tablet:h-[24px] tablet:w-[24px]"><Icon icon={isTablet ? 'ph:instagram-logo' : 'ph:instagram-logo'}/></a>
                    <a href="https://github.com/zielfino" class="tablet:h-[24px] tablet:w-[24px]"><Icon icon={isTablet ? 'ph:github-logo' : 'ph:github-logo'}/></a>
                    <a href="https://discord.com/invite/syJjTyKhhb" class="tablet:h-[24px] tablet:w-[24px]"><Icon icon={isTablet ? 'ph:discord-logo' : 'ph:discord-logo'}/></a>
                    <a href="https://x.com/zielfino_" class="tablet:h-[24px] tablet:w-[24px]"><Icon icon={isTablet ? 'ph:x-logo' : 'ph:x-logo'}/></a>
                    <a href="https://dribbble.com/zielfino" class="tablet:h-[24px] tablet:w-[24px]"><Icon icon={isTablet ? 'ph:dribbble-logo' : 'ph:dribbble-logo'}/></a>
                    <a href="https://www.linkedin.com/in/zielfino/" class="tablet:h-[24px] tablet:w-[24px]"><Icon icon={isTablet ? 'ph:linkedin-logo' : 'ph:linkedin-logo'}/></a>
                </div>
            </div>
            
        </div>

        <!-- STRAIGHT -->
        <div class="straightline">
            <div class="notlast opacity-50"><div class="w-full">Privacy</div></div>
            <div class="notlast opacity-50"><div class="w-full">Terms</div></div>
            <div class="notlast"><a href="/login"><div class="w-full">Log In</div></a></div>
            <div class="notlast opacity-50"><div class="w-full">Feedback</div></div>
            <div class="notlast opacity-50"><div class="w-full">Disclaimer</div></div>
            <div class="max-tablet:my-4 opacity-50"><div class="w-full">Contact</div></div>
        </div>

        <!-- COPYRIGTH -->
        <div class="font-normal text-sm tablet:text-xs text-slate-800 text-start mt-4 tablet:text-center max-tablet:ml-6 max-tablet:my-12">
           <span> © {year} agerr.studio. All rights reserved.</span>
        </div>


        <!-- REFERENCE -->
        <div class="text-center font-[400] text-xs text-slate-800/50 mb-2 mt-16 phone:mt-12 tracking-wider">
            <div>Landing Reference: <a href="https://clickup.com/">ClickUp</a> & <a href="https://www.contentful.com/">Contenful</a></div>
            <div class="text-wrap">
                Every <b>pixel, line, and layout</b> you see here <br> is thoughtfully built by <b><a href="https://agerrstudio.com/">agerr.studio</a></b>.
            </div>
        </div>
        
    </div>
</footer>