# حزمة Hostinger الرسمية

## سبب خطأ 500

كانت طلبات PHP على Hostinger تفشل قبل تنفيذ مسار API بسبب وجود صياغة ودوال
من PHP 8 داخل الملفات التي يتم تحميلها مباشرة. لذلك كانت الاستجابة `500`
فارغة لمسارات مثل `/api/settings` و`/api/containers`، حتى مع سلامة قاعدة
البيانات.

## ما تم إصلاحه

- جعل `scripts/api-index.php` و`scripts/container-system.php` قابلين للتحليل
  والتنفيذ على PHP 7.4 أو أحدث.
- استبدال `match` و`?->` والأنواع `mixed` و`never` غير المدعومة في PHP 7.4.
- إضافة بدائل متوافقة لـ `str_starts_with` و`str_contains` و`str_ends_with`.
- إضافة مسار PHP العام `/api/structured-data` المطابق لعقد الواجهة.
- الإبقاء على مسارات التتبع العامة `/api/track` و`/api/visitor/*` ضمن نفس API.
- بناء المنصة التسويقية تحت `/cleanflow-platform/` فقط.
- منع تكرار اسم الشركة عند مزامنة النصوص القديمة داخل نسخة قاعدة البيانات.
- إيقاف إنشاء الأرشيف القديم `taqi-group-hostinger.zip`.

## البيانات والصور المعتمدة

يتم بناء الحزمة من قاعدة المصدر الحالية:

```text
data/sabaik.db
```

لا يتم اعتماد `build_php/data/sabaik.db` كمرجع. أثناء البناء تُنسخ قاعدة
المصدر إلى الأرشيف، مع إبقاء الإعدادات والصور الحالية. نسخة البناء الأخيرة
تحتوي على 6 خدمات، و5 باقات، و68 إعداداً، و5 شرائح، وإعلانين، كما تحتوي
على الشعار في `images/logo.png` وملفات الرفع في `uploads/`.

## الملف الذي يتم رفعه

استخدم هذا الملف فقط:

```text
hawiat-sys-hostinger.zip
```

قبل فك الضغط على Hostinger:

1. خذ نسخة احتياطية من الموقع الحالي وقاعدة البيانات إن وجدت.
2. احذف الملفات القديمة من `public_html`، خصوصاً `api/` و`data/` و`uploads/`
   ومجلد `taqi-group-platform/` إن كان موجوداً.
3. ارفع `hawiat-sys-hostinger.zip` إلى `public_html`.
4. فك الضغط مباشرة داخل `public_html`، وليس داخل مجلد فرعي.
5. تأكد من وجود `index.html` و`api/` و`data/` و`uploads/` في جذر
   `public_html`.
6. اضبط إصدار PHP في Hostinger على PHP 7.4 أو أحدث، وتأكد من تفعيل PDO
   SQLite.
7. امسح كاش Hostinger والمتصفح، ثم اختبر:

```text
https://sabaik.net/
https://sabaik.net/api/healthz
https://sabaik.net/api/settings
https://sabaik.net/api/containers
https://sabaik.net/api/structured-data?path=/
```

يجب أن تعيد مسارات API استجابة JSON، لا صفحة HTML ولا استجابة 500 فارغة.

## إعادة إنشاء الحزمة

من جذر المشروع:

```bash
HOSTINGER_PRESERVE_SOURCE=1 node scripts/build-hostinger.mjs
```

يأخذ هذا الوضع لقطة متسقة من قاعدة المشروع دون تعديلها، ويبني الواجهتين،
ويطبق تصحيحات SEO المعتمدة داخل الأرشيف فقط، ثم يفحص PHP ومسارات API ويشغل
بوابة SEO على الأرشيف النهائي. يجب أن تنتهي العملية برسالة:

```text
SEO QUALITY GATE: PASS
```

## نتيجة الإصلاح الحالي

تمت إعادة بناء `hawiat-sys-hostinger.zip` بنجاح، ونجحت بوابة SEO
النهائية. لا تعتمد أو تعيد رفع أي أرشيف باسم `taqi-group-hostinger.zip`.