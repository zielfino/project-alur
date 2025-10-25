<script lang="ts">
    import { isLoginModalOpen, isSigningUpMode } from '$lib/stores/uiStore';
	import Login from './login.svelte';
	import { fade } from 'svelte/transition';
    import { quadOut } from 'svelte/easing';
	import Logosvg from '$lib/assets/logosvg.svelte';

    let parentLogin: HTMLElement | null = null;
    let loginButton: HTMLElement | null = null;
    let signupButton: HTMLElement | null = null;

    function addHover() {
	    if (window.innerWidth < 500) return;
        parentLogin?.classList.add('bg-slate-200');
        signupButton?.classList.add('text-slate-200');
        parentLogin?.classList.remove('bg-white');
        signupButton?.classList.remove('text-white');
    }
    function removeHover() {
	    if (window.innerWidth < 500) return;
        parentLogin?.classList.add('bg-white');
        signupButton?.classList.add('text-white');
        parentLogin?.classList.remove('bg-slate-200');
        signupButton?.classList.remove('text-slate-200');
    }

    function addFocus() {
	    if (window.innerWidth < 500) return;
        parentLogin?.classList.add('bg-sky-100');
        parentLogin?.classList.add('ring-2');
        parentLogin?.classList.add('ring-sky-500');
        signupButton?.classList.add('text-sky-100');
        parentLogin?.classList.remove('bg-white');
        signupButton?.classList.remove('text-white');
    }
    function removeFocus() {
	    if (window.innerWidth < 500) return;
        parentLogin?.classList.add('bg-white');
        signupButton?.classList.add('text-white');
        parentLogin?.classList.remove('bg-sky-100');
        parentLogin?.classList.remove('ring-2');
        parentLogin?.classList.remove('ring-sky-500');
        signupButton?.classList.remove('text-sky-100');
    }

    function openLoginModal() {
        isLoginModalOpen.set(true); 
        isSigningUpMode.set(false);
    }
    function openSigninModal() {
        isLoginModalOpen.set(true); 
        isSigningUpMode.set(true); 
    }
</script>

<!-- NAVIGATION -->
<nav class="z-50 flex fixed top-0 justify-center phone:justify-between items-center pt-4 h-[60px] select-none drop-shadow-xl">
    <a href="https://agerrstudio.com" class="specialbutton px-4 h-[56px] phone:h-full w-1/2 phone:w-auto flex justify-start phone:justify-center items-center rounded-s-xl phone:rounded-xl phone:border phone:border-slate-300 translate-x-[1px]">
        <div class="w-18 phone:pr-3 phone:mr-3">
            <Logosvg/>
        </div>
        <div class="text text-zinc-800 hidden phone:block mb-0.5">Organize All<br>Your Project</div>
    </a>
    <div class="phone:flex phone:space-x-2 phone:h-full -translate-x-[1px]">
        <a href="https://zielalfino.agerrstudio.com" class="specialbutton h-full hidden tablet:flex justify-center items-center cursor-pointer px-5 text-zinc-800 rounded-xl border border-slate-300">
            <span class="text-zinc-800">Contact Me</span>
        </a>
        <div bind:this={parentLogin} class="group p-2 phone:p-1 h-[56px] phone:h-full flex justify-center items-center space-x-2 phone:space-x-1 bg-white rounded-e-xl phone:rounded-xl phone:border phone:border-slate-300">
            <button bind:this={loginButton} onclick={openLoginModal} onmouseenter={addHover} onmouseleave={removeHover} onfocus={addFocus} onblur={removeFocus} 
            class="h-full text-base phone:text-sm flex justify-center items-center cursor-pointer px-3 rounded-lg text-zinc-800 max-phone:focus-visible:bg-sky-100 max-phone:focus-visible:ring-2 max-phone:focus-visible:ring-sky-500">Log In</button>
            <button bind:this={signupButton} onclick={openSigninModal} class="agerrbggradient specialbutton h-full text-base phone:text-sm flex justify-center items-center cursor-pointer px-3.5 phone:px-3 rounded-lg font-bold text-white">Sign Up</button>
        </div>
    </div>
</nav>


{#if $isLoginModalOpen}
    <div transition:fade={{ duration: 150, easing: quadOut }} class="bgbackdrop flex">    
        <Login />
    </div>
{/if}