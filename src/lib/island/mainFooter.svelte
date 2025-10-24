<script lang="ts">
	import Logosvg from "$lib/assets/logosvg.svelte";

    const year = new Date().getFullYear();
</script>

<footer>

    <!-- HEAD -->
    <div class="fullwiddhcover">
        <div class="container text flex items-center">

            <!-- LOGO -->
            <Logosvg />

            <!-- TAGLINE -->
            <div class="">
                Organize all your <br class="phone:hidden"> project, find a flow.
            </div>

        </div>
    </div>

    <!-- CONTENT -->
    <div class="container text pt-6 phone:pt-4 laptop:pt-8">

        <!-- LINKS -->
        <div class="links">

            <!-- BLANKSPACE -->
            <div class="max-phone:hidden col-span-1 tablet:col-span-3 laptop:col-span-4 order-2"></div>

            <!-- LINK -->
            <div class="link order-1 phone:order-1">
                <h4 class="title">Project Alur</h4>
                <ul>
                    <li><a href="/">About</a></li>
                    <li><a href="/">Privacy</a></li>
                    <li><a href="/">Contact</a></li>
                    <li><a href="/">Terms</a></li>
                </ul>
            </div>
            <div class="link order-3">
                <h4 class="title">Projects</h4>
                <ul>
                    <li>NECOFE</li>
                    <li><a href="https://kasatara.agerrstudio.com">KASATARA</a></li>
                    <li><a href="/">Project Alur</a></li>
                </ul>
            </div>
            <div class="link order-4">
                <h4 class="title">agerr site</h4>
                <ul>
                    <li><a href="https://agerrstudio.com">agerr.studio</a></li>
                    <li>agerr.blog</li>
                    <li>agerr.store</li>
                </ul>
            </div>
            <div class="link order-2 phone:order-5">
                <h4 class="title">My Links</h4>
                <ul>
                    <li><a href="https://www.linkedin.com/in/zielfino/">LinkedIn</a></li>
                    <li><a href="https://github.com/zielfino">Github</a></li>
                    <li><a href="https://dribbble.com/zielfino">Dribble</a></li>
                    <li><a href="https://zielalfino.com/">Website</a></li>
                </ul>
            </div>
        </div>
        
        <!-- COPYRIGTH -->
        <div class="font-semibold text-xs text-slate-800 italic max-phone:mt-4">
           <span> © {year} agerr.studio. All right reserved</span>
        </div>

        <!-- REFERENCE -->
        <div class="text-center font-[400] text-xs text-slate-800/50 mb-2 mt-16 phone:mt-12 tracking-wider">
            <span>landing reference: <a href="/">ClickUp</a> & <a href="/">Contenful</a></span>
        </div>
        
    </div>
</footer>