<div class="blob-content-holder" id="blob-content-holder">
<article class="file-holder">
<div class="js-file-title file-title-flex-parent">
<div class="file-header-content">
<i aria-hidden="true" data-hidden="true" class="fa fa-file-text-o fa-fw"></i>
<strong class="file-title-name">
phase-b.md
</strong>
<button class="btn btn-clipboard btn-transparent prepend-left-5" data-toggle="tooltip" data-placement="bottom" data-container="body" data-class="btn-clipboard btn-transparent prepend-left-5" data-title="Copy file path to clipboard" data-clipboard-text="{&quot;text&quot;:&quot;phase-b.md&quot;,&quot;gfm&quot;:&quot;`phase-b.md`&quot;}" type="button" title="Copy file path to clipboard" aria-label="Copy file path to clipboard"><svg><use xlink:href="https://gitlab.com/assets/icons-ae469cb7c3780342292c08ece911202a09416439a29a034fa70e29da909b0225.svg#duplicate"></use></svg></button>
<small>
4.82 KB
</small>
</div>

<div class="file-actions">
<div class="btn-group js-blob-viewer-switcher" role="group">
<button aria-label="Display source" class="btn btn-default btn-sm js-blob-viewer-switch-btn has-tooltip" data-container="body" data-viewer="simple" title="Display source">
<i aria-hidden="true" data-hidden="true" class="fa fa-code"></i>
</button><button aria-label="Display rendered file" class="btn btn-default btn-sm js-blob-viewer-switch-btn has-tooltip active" data-container="body" data-viewer="rich" title="Display rendered file">
<i aria-hidden="true" data-hidden="true" class="fa fa-file-text-o"></i>
</button></div>

<div class="btn-group" role="group"><button class="btn btn-sm js-copy-blob-source-btn disabled" data-toggle="tooltip" data-placement="bottom" data-container="body" data-class="btn btn-sm js-copy-blob-source-btn" data-title="Copy source to clipboard" data-clipboard-target=".blob-content[data-blob-id='ed9635ff0a268dcee0f7c572ab27c5019eb754e5']" type="button" title="" aria-label="Copy source to clipboard" data-original-title="Switch to the source to copy it to the clipboard"><svg><use xlink:href="https://gitlab.com/assets/icons-ae469cb7c3780342292c08ece911202a09416439a29a034fa70e29da909b0225.svg#duplicate"></use></svg></button><a class="btn btn-sm has-tooltip" target="_blank" rel="noopener noreferrer" title="Open raw" data-container="body" href="/ben-gurion/sqe-workshop-2018/raw/master/phase-b.md"><i aria-hidden="true" data-hidden="true" class="fa fa-file-code-o"></i></a><a download="phase-b.md" class="btn btn-sm has-tooltip" target="_blank" rel="noopener noreferrer" title="Download" data-container="body" href="/ben-gurion/sqe-workshop-2018/raw/master/phase-b.md?inline=false"><svg><use xlink:href="https://gitlab.com/assets/icons-ae469cb7c3780342292c08ece911202a09416439a29a034fa70e29da909b0225.svg#download"></use></svg></a></div>
<div class="btn-group" role="group">
<a class="btn js-edit-blob  btn-sm" href="/ben-gurion/sqe-workshop-2018/edit/master/phase-b.md">Edit</a><a class="btn btn-default btn-sm" href="/-/ide/project/ben-gurion/sqe-workshop-2018/edit/master/-/phase-b.md">Web IDE</a></div>
</div>
</div>

<script id="js-file-lock" type="application/json">
{"path":"phase-b.md","toggle_path":"/ben-gurion/sqe-workshop-2018/path_locks/toggle"}
</script>


<div class="blob-viewer hidden" data-type="simple" data-url="/ben-gurion/sqe-workshop-2018/blob/master/phase-b.md?format=json&amp;viewer=simple">
<div class="text-center prepend-top-default append-bottom-default">
<i aria-hidden="true" aria-label="Loading content…" class="fa fa-spinner fa-spin fa-2x"></i>
</div>

</div>

<div class="blob-viewer" data-rich-type="markup" data-type="rich" data-url="/ben-gurion/sqe-workshop-2018/blob/master/phase-b.md?format=json&amp;viewer=rich" data-loading="true" data-loaded="true"><div class="blob-viewer" data-rich-type="markup" data-type="rich">
<div class="file-content md wiki">
<h1 dir="auto">
<a id="user-content-הנדסת-איכות-תוכנה-סדנה-שלב-ב" class="anchor" href="#%D7%94%D7%A0%D7%93%D7%A1%D7%AA-%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%AA%D7%95%D7%9B%D7%A0%D7%94-%D7%A1%D7%93%D7%A0%D7%94-%D7%A9%D7%9C%D7%91-%D7%91" aria-hidden="true"></a>הנדסת איכות תוכנה - סדנה - שלב ב'</h1>
<h3 dir="auto">
<a id="user-content-נושא-symbolic-substitution" class="anchor" href="#%D7%A0%D7%95%D7%A9%D7%90-symbolic-substitution" aria-hidden="true"></a>נושא: symbolic substitution</h3>
<p dir="auto">בשלב זה יפותח רכיב מערכת שהקלט שלו מורכב מ:</p>
<ul dir="auto">
<li>קטע קוד הכולל פונציה ומשתנים נוספים (לא בהכרח בסדר הזה)</li>
<li>קלט לפונקציה בפורמט הבא:
<ul>
<li>agr-1, arg-2, ..., arg-n</li>
<li>מחרוזת "תעטף" בגרש או גרשיים. דוגמה: 'hello world'</li>
<li>ערך מספרי או בוליאני. דוגמה: 1, true, 3.14</li>
<li>מערך יופיע "עטוף" בסוגריים מרובעים. דוגמה: [1, 2, 3], [hello', 5, true']</li>
</ul>
</li>
</ul>
<p dir="auto">והפלט שלו מורכב מהחלקים הבאים:</p>
<ul dir="auto">
<li>
<p>הפונקציה, לאחר שעברה תהליך של <strong>symbolic substitution</strong></p>
</li>
<li>
<p>כל ה statements בפונקציה החדשה שהן פרדיקטים מסוג if-else, במסלול שנגזר מהקלט יצבעו על פי המדיניות הבאה:</p>
<ul>
<li>ערך האמת שלהם ע"פ הקלט הנתון הוא אמת - צבע רקע ירוק</li>
<li>ערך האמת שלהם ע"פ הקלט הנתון הוא שקר - צבע רקע אדום</li>
<li>צבעי הרקע לא יסתירו את הטקסט</li>
</ul>
</li>
<li>
<p>פונקצית הקלט תוכל לכלול:</p>
<ul>
<li>הגדרה והשמה של משתנים</li>
<li>תנאים מסוג if - else-if - else</li>
<li>לולאות while</li>
</ul>
</li>
<li>
<p>בתנאי if-else ובתנאי הלולאה יבוצע שימוש במשתנים מה input-vector או משתנים לוקאליים שניתנים לביטוי ע"י ה input-vector</p>
</li>
<li>
<p>דוגמאות ל symbolic-substitution:</p>
</li>
</ul>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    let a = x + 1;</span>
<span id="LC3" class="line" lang="plaintext">    let b = a + y;</span>
<span id="LC4" class="line" lang="plaintext">    let c = 0;</span>
<span id="LC5" class="line" lang="plaintext">    </span>
<span id="LC6" class="line" lang="plaintext">    if (b &lt; z) {</span>
<span id="LC7" class="line" lang="plaintext">        c = c + 5;</span>
<span id="LC8" class="line" lang="plaintext">        return x + y + z + c;</span>
<span id="LC9" class="line" lang="plaintext">    } else if (b &lt; z * 2) {</span>
<span id="LC10" class="line" lang="plaintext">        c = c + x + 5;</span>
<span id="LC11" class="line" lang="plaintext">        return x + y + z + c;</span>
<span id="LC12" class="line" lang="plaintext">    } else {</span>
<span id="LC13" class="line" lang="plaintext">        c = c + z + 5;</span>
<span id="LC14" class="line" lang="plaintext">        return x + y + z + c;</span>
<span id="LC15" class="line" lang="plaintext">    }</span>
<span id="LC16" class="line" lang="plaintext">}</span></code></pre>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    if (x + 1 + y &lt; z) {</span>
<span id="LC3" class="line" lang="plaintext">        return x + y + z + 5;</span>
<span id="LC4" class="line" lang="plaintext">    } else if (x + 1 + y &lt; z * 2) {</span>
<span id="LC5" class="line" lang="plaintext">        return x + y + z + x + 5;</span>
<span id="LC6" class="line" lang="plaintext">    } else {</span>
<span id="LC7" class="line" lang="plaintext">        return x + y + z + z + 5;</span>
<span id="LC8" class="line" lang="plaintext">    }</span>
<span id="LC9" class="line" lang="plaintext">}</span></code></pre>
<hr>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    let a = x + 1;</span>
<span id="LC3" class="line" lang="plaintext">    let b = a + y;</span>
<span id="LC4" class="line" lang="plaintext">    let c = 0;</span>
<span id="LC5" class="line" lang="plaintext">    </span>
<span id="LC6" class="line" lang="plaintext">    while (a &lt; z) {</span>
<span id="LC7" class="line" lang="plaintext">        c = a + b;</span>
<span id="LC8" class="line" lang="plaintext">        z = c * 2;</span>
<span id="LC9" class="line" lang="plaintext">    }</span>
<span id="LC10" class="line" lang="plaintext">    </span>
<span id="LC11" class="line" lang="plaintext">    return z;</span>
<span id="LC12" class="line" lang="plaintext">}</span></code></pre>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    while (x + 1 &lt; z) {</span>
<span id="LC3" class="line" lang="plaintext">        z = (x + 1 + x + 1 + y) * 2;</span>
<span id="LC4" class="line" lang="plaintext">    }</span>
<span id="LC5" class="line" lang="plaintext">    </span>
<span id="LC6" class="line" lang="plaintext">    return z;</span>
<span id="LC7" class="line" lang="plaintext">}</span></code></pre>
<hr>
<ul dir="auto">
<li>לא תנתן פונקציה שבה משתנים לוקאליים בתנאי לא ניתנים לפירוש מיידי ע"י ה input-vector</li>
</ul>
<p dir="auto">בדוגמה הבאה המשתנה c לא ניתן לפירוש מיידי</p>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    let a = x + 1;</span>
<span id="LC3" class="line" lang="plaintext">    let b = a + y;</span>
<span id="LC4" class="line" lang="plaintext">    let c = 0;</span>
<span id="LC5" class="line" lang="plaintext">    </span>
<span id="LC6" class="line" lang="plaintext">    while (c++ &lt; 10) {</span>
<span id="LC7" class="line" lang="plaintext">        a = x * y;</span>
<span id="LC8" class="line" lang="plaintext">        z = a * b * c;</span>
<span id="LC9" class="line" lang="plaintext">    }</span>
<span id="LC10" class="line" lang="plaintext">    </span>
<span id="LC11" class="line" lang="plaintext">    return z;</span>
<span id="LC12" class="line" lang="plaintext">}</span></code></pre>
<ul dir="auto">
<li>דוגמה לצביעה של מסלול:</li>
</ul>
<p dir="auto">עבור הקלט (x=1, y=2, z=3) והפונקציה:</p>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    let a = x + 1;</span>
<span id="LC3" class="line" lang="plaintext">    let b = a + y;</span>
<span id="LC4" class="line" lang="plaintext">    let c = 0;</span>
<span id="LC5" class="line" lang="plaintext">    </span>
<span id="LC6" class="line" lang="plaintext">    if (b &lt; z) {</span>
<span id="LC7" class="line" lang="plaintext">        c = c + 5;</span>
<span id="LC8" class="line" lang="plaintext">        return x + y + z + c;</span>
<span id="LC9" class="line" lang="plaintext">    } else if (b &lt; z * 2) {</span>
<span id="LC10" class="line" lang="plaintext">        c = c + x + 5;</span>
<span id="LC11" class="line" lang="plaintext">        return x + y + z + c;</span>
<span id="LC12" class="line" lang="plaintext">    } else {</span>
<span id="LC13" class="line" lang="plaintext">        c = c + z + 5;</span>
<span id="LC14" class="line" lang="plaintext">        return x + y + z + c;</span>
<span id="LC15" class="line" lang="plaintext">    }</span>
<span id="LC16" class="line" lang="plaintext">}</span></code></pre>
<p dir="auto">התוצאה תהיה:</p>
<pre class="code highlight js-syntax-highlight plaintext white" lang="plaintext" v-pre="true"><code><span id="LC1" class="line" lang="plaintext">function foo(x, y, z){</span>
<span id="LC2" class="line" lang="plaintext">    if (x + 1 + y &lt; z) {                //this line is red</span>
<span id="LC3" class="line" lang="plaintext">        return x + y + z + 5;</span>
<span id="LC4" class="line" lang="plaintext">    } else if (x + 1 + y &lt; z * 2) {     //this line is green</span>
<span id="LC5" class="line" lang="plaintext">        return x + y + z + x + 5; </span>
<span id="LC6" class="line" lang="plaintext">    } else {</span>
<span id="LC7" class="line" lang="plaintext">        return x + y + z + z + 5;</span>
<span id="LC8" class="line" lang="plaintext">    }</span>
<span id="LC9" class="line" lang="plaintext">}</span></code></pre>
<hr>
<p dir="auto">כללים:</p>
<ul dir="auto">
<li>עבור המימוש יכתבו בדיקות יחידה בכיסוי של 100%.</li>
<li>מומלץ לבנות את הקוד בצורה מודולרית.</li>
<li>הקלט  יהיה חוקי.</li>
<li>הפלט יופיע על המסך בצורה ויזואלית (view) אך קיימת חובה להחזיק ברקע את המידע בצורה של אובייקטים או מבני נתונים יעודיים.</li>
</ul>
<p dir="auto">הרכב הציון:</p>
<p dir="auto">בדיקה אוטומטית:</p>
<ul dir="auto">
<li>מס' טסטים שעברו / מס' טסטים כולל - מינימום של 10 טסטים - 15%</li>
<li>אחוז כיסוי קוד - 15%</li>
<li>15% - Max (0, 100 - (כמות שגיאות כלי אנליזה סטטית))</li>
</ul>
<p dir="auto">בדיקה ידנית:</p>
<ul dir="auto">
<li>שתי בדיקות ידניות - 55%</li>
</ul>
<p dir="auto">בנוסף:</p>
<ul dir="auto">
<li>כלי הבדיקה האוטומטיים ניתנים לסטודנטים לשם קבלת מדדים בזמן הפיתוח.</li>
<li>תתבצע בדיקה אוטומטית להעתקות של קוד.</li>
<li>
<a href="https://github.com/aviram26/sqe-workshop-2018-sample-project" rel="nofollow noreferrer noopener" target="_blank">https://github.com/aviram26/sqe-workshop-2018-sample-project</a>  פרויקט לדוגמה נמצא כאן:</li>
<li>הפרויקט מכיל דוגמת קוד מלאה, דוגמה לקלט/פלט, כלים אפשריים לניתוח קוד וסקריפטים לביצוע הבדיקות הרלוונטיות</li>
</ul>
</div>

</div>
</div>


</article>
</div>