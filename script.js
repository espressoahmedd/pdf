// دالة لإصلاح الجداول الصغيرة لجعلها تأخذ العرض الكامل
function adjustTablesForPrint() {
    // تحديد جميع الجداول الصغيرة
    const smallTables = document.querySelectorAll('.content-table');
    
    smallTables.forEach(table => {
        // إذا كان الجدول صغيراً، أجعله يأخذ العرض الكامل
        if (table.offsetWidth < 500) {
            table.style.width = '100%';
            table.classList.add('full-width');
        }
    });
    
    // إصلاح عرض الجداول في الشبكات
    const gridItems = document.querySelectorAll('.grid-item table');
    gridItems.forEach(table => {
        table.style.width = '100%';
    });
}

// دالة لتحضير الصفحة للطباعة
function prepareForPrint() {
    // إخفاء خطوط الصفحة العلوية والسفلية
    const topLines = document.querySelectorAll('.page-top-line');
    const bottomLines = document.querySelectorAll('.page-bottom-line');
    
    topLines.forEach(line => line.style.display = 'none');
    bottomLines.forEach(line => line.style.display = 'none');
    
    // تفريغ محتوى التذييل مع الحفاظ على العنصر
    const footers = document.querySelectorAll('.page-footer');
    footers.forEach(footer => {
        footer.innerHTML = '';
    });
    
    // ضبط جميع الجداول لتأخذ العرض الكامل
    adjustTablesForPrint();
    
    // إضافة حدث الطباعة
    window.addEventListener('beforeprint', () => {
        console.log('جاري التحضير للطباعة...');
        optimizePrinting();
        
        // التأكد من ظهور جميع العناصر
        document.body.style.overflow = 'visible';
        
        // إزالة أي أنماط قد تخفي المحتوى
        document.querySelectorAll('*').forEach(element => {
            element.style.overflow = 'visible !important';
            element.style.height = 'auto !important';
            element.style.maxHeight = 'none !important';
        });
    });
    
    window.addEventListener('afterprint', () => {
        console.log('تمت الطباعة');
        // يمكن إعادة العناصر لحالتها الأصلية إذا لزم الأمر
        restoreAfterPrint();
    });
}

// دالة للتحقق من تداخل العناصر
function checkElementOverlap() {
    const elements = document.querySelectorAll('.page > *:not(.page-top-line):not(.page-bottom-line):not(.page-footer):not(.page-number)');
    
    elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        
        // التحقق من التداخل مع العناصر الأخرى
        elements.forEach((otherElement, otherIndex) => {
            if (index !== otherIndex) {
                const otherRect = otherElement.getBoundingClientRect();
                
                // إذا كان هناك تداخل
                if (rect.bottom > otherRect.top && rect.top < otherRect.bottom) {
                    console.warn('تداخل محتمل:', element, otherElement);
                }
            }
        });
    });
}

// دالة متقدمة لتحسين الطباعة
function optimizePrinting() {
    console.log('جاري تحسين الطباعة...');
    
    // التأكد من أن جميع الألوان صالحة للطباعة
    document.querySelectorAll('*').forEach(element => {
        const styles = window.getComputedStyle(element);
        
        // تحويل الألوان الفاتحة جداً إلى ألوان مناسبة للطباعة
        if (styles.backgroundColor) {
            const bgColor = styles.backgroundColor;
            if (bgColor.includes('rgba(0, 0, 0, 0)') || bgColor === 'transparent') {
                element.style.backgroundColor = '#ffffff';
            }
        }
        
        // تحويل ألوان النص الفاتحة
        if (styles.color) {
            const textColor = styles.color;
            if (textColor.includes('rgba(0, 0, 0, 0)') || textColor === 'transparent') {
                element.style.color = '#000000';
            }
        }
    });
    
    // ضبط ارتفاع الصفحات لمنع التداخل
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        const contentHeight = page.scrollHeight;
        const maxHeight = 29.7 * 37.8; // 29.7cm بالبكسل
        
        if (contentHeight > maxHeight) {
            console.warn(`الصفحة ${index + 1} أطول من اللازم: ${contentHeight}px`);
            
            // تقليل الهوامش للصفحات الطويلة
            page.style.padding = '1.5cm 1.5cm';
            page.style.fontSize = '16px';
            
            // تقليل حجم الصور
            const images = page.querySelectorAll('img');
            images.forEach(img => {
                img.style.maxWidth = '50%';
            });
        }
        
        // إضافة فاصل صفحات قبل كل صفحة
        if (index > 0) {
            page.style.pageBreakBefore = 'always';
        }
    });
    
    // إضافة فواصل صفحات قبل الجداول الكبيرة
    const largeTables = document.querySelectorAll('table');
    largeTables.forEach(table => {
        if (table.offsetHeight > 400) {
            table.style.pageBreakInside = 'avoid';
            const parent = table.parentElement;
            if (parent && parent.classList.contains('session-content')) {
                parent.style.pageBreakBefore = 'auto';
            }
        }
    });
    
    // ضبط ألوان النصوص المهمة
    document.querySelectorAll('.important, .highlight, .activity-title, h2, h3, h4').forEach(element => {
        element.style.color = '#2c5aa0';
    });
    
    document.querySelectorAll('.note').forEach(element => {
        element.style.backgroundColor = '#fff3cd';
        element.style.color = '#856404';
    });
    
    // ضبط ألوان الجداول
    document.querySelectorAll('.content-table th, .index-table th').forEach(th => {
        th.style.backgroundColor = '#2c5aa0';
        th.style.color = '#ffffff';
    });
    
    document.querySelectorAll('.content-table td, .index-table td').forEach(td => {
        td.style.backgroundColor = '#f9f9f9';
        td.style.color = '#000000';
    });
    
    // إصلاح النصوص في الخلايا الملونة
    document.querySelectorAll('.content-table tr td[style*="background-color"]').forEach(td => {
        td.style.color = '#000000';
        const strongElements = td.querySelectorAll('strong');
        strongElements.forEach(strong => {
            strong.style.color = '#000000';
        });
    });
    
    // جدول التقييم النهائي
    document.querySelectorAll('.final-evaluation th').forEach(th => {
        th.style.backgroundColor = '#2c5aa0';
        th.style.color = '#ffffff';
    });
    
    document.querySelectorAll('.final-evaluation td').forEach(td => {
        td.style.backgroundColor = '#f9f9f9';
        td.style.color = '#000000';
    });
    
    document.querySelectorAll('.final-evaluation td:last-child').forEach(td => {
        td.style.color = '#2c5aa0';
    });
}

// دالة لاستعادة الإعدادات بعد الطباعة
function restoreAfterPrint() {
    console.log('جاري استعادة الإعدادات...');
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.padding = '';
        page.style.fontSize = '';
        page.style.pageBreakBefore = '';
        
        // استعادة حجم الصور
        const images = page.querySelectorAll('img');
        images.forEach(img => {
            img.style.maxWidth = '';
        });
    });
    
    // إظهار خطوط الصفحة
    const topLines = document.querySelectorAll('.page-top-line');
    const bottomLines = document.querySelectorAll('.page-bottom-line');
    
    topLines.forEach(line => line.style.display = 'block');
    bottomLines.forEach(line => line.style.display = 'block');
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة، جاري التحضير للطباعة...');
    
    // ضبط الجداول
    adjustTablesForPrint();
    
    // التحقق من التداخل
    checkElementOverlap();
    
    // إعداد مستمع حدث الطباعة
    prepareForPrint();
    
    // إضافة زر طباعة
    const printButton = document.createElement('button');
    printButton.textContent = 'طباعة المستند';
    printButton.id = 'print-button';
    printButton.style.position = 'fixed';
    printButton.style.top = '10px';
    printButton.style.left = '10px';
    printButton.style.zIndex = '1000';
    printButton.style.padding = '10px 20px';
    printButton.style.backgroundColor = '#2c5aa0';
    printButton.style.color = 'white';
    printButton.style.border = 'none';
    printButton.style.borderRadius = '5px';
    printButton.style.cursor = 'pointer';
    printButton.style.fontFamily = 'Arial, sans-serif';
    printButton.style.fontSize = '14px';
    
    printButton.addEventListener('click', function() {
        // التحضير النهائي قبل الطباعة
        optimizePrinting();
        
        // تأخير بسيط لضمان تطبيق التغييرات
        setTimeout(() => {
            window.print();
        }, 100);
    });
    
    document.body.appendChild(printButton);
    
    // نصائح الطباعة
    console.log('نصائح الطباعة:');
    console.log('1. تأكد من اختيار "خلفيات الرسومات" في إعدادات الطباعة');
    console.log('2. استخدم حجم الصفحة A4');
    console.log('3. تأكد من ضبط الهوامش على "افتراضي" أو "لا شيء"');
    console.log('4. في Chrome: File > Print > More settings > Check "Background graphics"');
});

// دالة مساعدة لتحسين الطباعة
function optimizePrint() {
    // تعطيل التحويلات والحركات
    document.querySelectorAll('*').forEach(el => {
        el.style.transition = 'none !important';
        el.style.animation = 'none !important';
    });
    
    // ضبط ألوان النص للطباعة
    document.body.style.color = '#000000';
    
    // إزالة أي صور خلفية
    document.body.style.backgroundImage = 'none';
    
    return true;
}

// استدعاء دالة التحسين قبل الطباعة
if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(mql => {
        if (mql.matches) {
            optimizePrint();
        }
    });
}

// ضمان تحميل الصور قبل الطباعة
window.addEventListener('load', function() {
    console.log('تم تحميل جميع الصور، جاهز للطباعة');
    
    // إضافة نص توجيهي
    const guide = document.createElement('div');
    guide.id = 'print-guide';
    guide.style.position = 'fixed';
    guide.style.bottom = '10px';
    guide.style.left = '10px';
    guide.style.backgroundColor = '#2c5aa0';
    guide.style.color = 'white';
    guide.style.padding = '10px';
    guide.style.borderRadius = '5px';
    guide.style.zIndex = '999';
    guide.style.fontSize = '12px';
    guide.style.maxWidth = '300px';
    guide.innerHTML = '<strong>نصائح الطباعة:</strong><br>1. اضغط على زر الطباعة أعلاه<br>2. في إعدادات الطباعة، اختر "خلفيات الرسومات"<br>3. اختر حجم الصفحة A4';
    
    document.body.appendChild(guide);
    
    // إخفاء التوجيه بعد 10 ثوان
    setTimeout(() => {
        guide.style.display = 'none';
    }, 10000);
});