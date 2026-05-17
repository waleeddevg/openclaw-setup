@echo off
echo ===================================================
echo CLAWSETUP AI - AUTOMATED DEPLOYMENT SCRIPT (VERCEL)
echo ===================================================
echo.
echo Installing Vercel CLI globally...
call npm install -g vercel

echo.
echo ===================================================
echo Step 1: Login to Vercel (Browser will open automatically)
echo Please log in with your GitHub or Email.
echo ===================================================
call vercel login

echo.
echo ===================================================
echo Step 2: Deploying to Production!
echo Just press ENTER when asked questions (use default answers).
echo For "Link to existing project?", press N.
echo ===================================================
call vercel --prod

echo.
echo ===================================================
echo Step 3: Deployment Complete!
echo Next, you need to add your Environment Variables.
echo Go to your Vercel Dashboard -> Settings -> Environment Variables.
echo Open .env.local in your editor and copy/paste all variables there!
echo ===================================================
pause
