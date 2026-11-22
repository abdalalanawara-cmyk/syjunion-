<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c2ada546-28ca-4d2a-b457-270ace57f34a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## التشغيل والاختبار
```sh
npm ci
npm test
npm run build:css
```
اعرض مجلد `www` باستخدام خادم محلي بسيط مثل `python -m http.server 8000 --directory www`، ثم افتح `http://localhost:8000`.

الكود الرئيسي: `www/model.js` لتحليل المبالغ والتحقق، و`www/app.js` للحفظ والعرض. التصميم في `www/index.html` و`tailwind.config.js`. عند تعديل CSS شغّل `npm run build:css` واحفظ الناتج `www/styles.css`.

## إنشاء APK
عدّل اسم ومعرف التطبيق في `capacitor.config.json` ثم شغّل Workflow **Build Android APK** من GitHub Actions. الناتج **Debug APK** للتجربة وليس إصدار متجر. البناء يحتاج الإنترنت، أما تشغيل ملفات التطبيق المضمّنة فلا يحتاجه. لا تَعِد بمدة بناء محددة: تختلف حسب GitHub Actions والشبكة.

بعد البناء اختبر على هاتف فعلي: أضف مصروفًا، أغلق التطبيق بالكامل ثم افتحه، ثم كرر مع وضع الطيران من أول تشغيل. اختبارات المستودع تتحقق من منطق البيانات وبنية DOM، لكنها لا تغني عن اختبار Android فعلي.
