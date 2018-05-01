# Learn-Lidemy-FE201-Twitch-Live-Streams
---
## HW1: [CSS 九宮格切板](https://codepen.io/KOLiu/pen/pLMbOM?editors=0100)

    ### 主要使用技巧
    - 利用 flex 排版
    - 利用 border-radius 來產生圓角矩形
    - 利用 border-radius: 50% 來產生圓形頭像圖
    - 利用 background-attachment:fixed 產生滾動視差效果

    ### 參考：
    1. https://flexboxfroggy.com/
    2. https://www.w3schools.com/cssref/css3_pr_flex.asp
    3. http://www.oxxostudio.tw/articles/201501/css-flexbox.html
    4. http://zh-tw.learnlayout.com/position.html

## HW2: [Hover effects](https://codepen.io/KOLiu/pen/rvBBbo?editors=1100)

    ### 主要使用技巧
    - 利用 transition, box-shadow 為 hover 加入漸變特效

    ### 參考：
    1. https://stackoverflow.com/questions/11703241/does-css-have-a-blur-selector-pseudo-class
    2. https://css-tricks.com/almanac/properties/f/filter/
    3. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
    4. https://www.w3schools.com/cssref/css3_pr_box-shadow.asp

## HW4: Ajax & Twitch API

    ### 主要使用技巧
    - 利用 Promise & XMLHttpRequest 進行非同步串接 Twitch 的 Streams

    ### Note
    - 同源政策解法：
        1. JSONP(JSON with Padding): 不推薦
            - 利用 <script src=""> 跨網域特性，先自定好一個 callback function 讓資料傳回後呼叫
                例如 Twitch 支援 url_path?args&callback=[callback function name]
            - 需要伺服器的支援
            - 只能利用 GET
            - 若 JSONP 的伺服器被入侵，將可仍導致安全性問題
        2. [跨來源資源共用（Cross-Origin Resource Sharing, CROS）](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/CORS)
            - 可透過 Response Headers 查看遠端支援 CROS 的網域
                - access-control-allow-origin: -
            - Request 分為兩類:
                1. Simple requests(簡單請求):
                    - 規範：
                        - 僅能用 GET, POST, HEAD
                        - Content-Type 只能是 application/x-www-form-urlencoded, multipart/form-data, text/plain
                    - 瀏覽器會直接發 request，但若遠端不支援 CROS 則取不到資料;
                    - 規範的標頭(自行參考規格書)
                2. Preflighted requests(預檢請求):
                    - 不符合 Simple requests 規範的請求(例如自訂的 Header)
                    - 瀏覽器會先自動發出一個 options 請求進行 CROS 支援狀況的檢查，若可存取才會再發實際的 request
            - 
    - ES6:
        - const {streams, ids} = data; // const streams = data.streams, ids = data.ids;
    - error-first in callback:
        - 程式碼與參數都以"錯誤"的處理為最優先
        - 規則:
            - callback的第一個參數保留給錯誤(error)物件：當錯誤發生時，它將會以第一個參數回傳。
            - callback的第2個參數保留給成功回應的資料。當沒有錯誤發生時，error(即第一個參數)會設定為null，然後將成功回應的資料傳入第二個參數。
        ```javascript
        function getTwitchData(cb) {
            ajax(twitchAPI.getURI(), "GET", twitchAPI.headers)
                .then(result => cb(null, JSON.parse(result)))
                .catch(err => cb(err));
        }

        getTwitchData((err, data) => { // error first
            if (err) { // 優先處理 error
                return console.log(err); // 加掛 return 是為了避免程式又往下執行
            }

            const { streams } = data;
            const lists = document.querySelector(".list");
            for (let stream of streams) {
                lists.innerHTML += genItem(stream);
            } 
        });
        ```

    ### 參考：
    * [Node.js error-first callback](http://eddychang.me/blog/javascript/57-node-js-error-first-callback.html)

## HW5 - Placeholder & Infinite Scroll

    ### 主要使用技巧
    - 利用 Vanilla JS 計算 Scroll 高度後符合條件後，再透過 Ajax 載入新的資料
        - 流程：
            1. 計算高度：
                - body.offsetHeight ~= window.innerHeight + window.pageYOffset
                - 通常不會真的到最底部才載入，會預留一定高度就開始載入
            2. 載入資料：
                - 利用 _loading 避免重複發出 request
                - 利用 offset 參數來向 Twitch 發出條件查詢 request
    - 利用 PlaceHolder 預先顯示佔位圖，以避免網速過慢導致畫面顯示不順暢
        - 先預設 img container 高度避免圖片未載入時跑版
        - 改用 base64 或存在本機端來加速顯示佔位圖:
            - 缺點：大小會比原本的 img 來的大；太大可能會不被瀏覽器接受
        - 要測試網速過慢情況，可用 Chrome Dev Tools: Network -> Presets
        - 利用 opacity 及 onload event 在圖片載入完成後漸變顯示圖片
        - 可以利用 .preview::before 來取代 div placeholder
        - 流程：
            1. 放兩張圖片在同一個 div 下的同一個位置(absolute, relative)
            2. 讓實際要顯示的圖片可以蓋掉佔位圖(z-index, relative)
            3. 把實際要顯示的圖片 opacity 初始值設為 0，等圖片真的載入完成時(onload)再改為 1

    ### 參考：
    * [Check if a user has scrolled to the bottom](https://stackoverflow.com/questions/3898130/check-if-a-user-has-scrolled-to-the-bottom)
    * [Vanilla JS AJAX, TIA, Infinite Scroll](https://codepen.io/timothyli/pen/JXVMZY?editors=0010)
    * [About height & width](https://codepen.io/KOLiu/pen/rvjPNj)
    * [The Window Object](https://www.w3schools.com/jsref/obj_window.asp)

## HW6: Vanilla JS

    ### Note:
    * 缺點：
        * 必須自行注意瀏覽器相容性
        * 團隊協作困難
        * 較難維護
    * 優點：
        * 效能高(規模小作用不大)
        * 檔案大小

    ### 參考：
    * [YOU MIGHT NOT NEED JQUERY](http://youmightnotneedjquery.com/)
    * [document.querySelector](https://developer.mozilla.org/zh-TW/docs/Web/API/Document/querySelector)
    * [You-Dont-Need-jQuery](https://github.com/nefe/You-Dont-Need-jQuery/blob/master/README.zh-CN.md)
    * [javascript 30](https://javascript30.com/)

## 模組化

    ### Note
    * 必須搭配 static Server 才能測試
    * 在 HTML 中必須使用 <script type="module"> 引入使用模組化語法的 js，不然會產生 Uncaught ReferenceError: Unexpected token export，不過使用 type="module" 會導致 onclick 觸發其中的 function 失效(Uncaught ReferenceError: changeLanguage is not defined)
    * onclick 觸發失效的解決方法是使用 addEventListener("click",fn)，原因是 onclick 的作用域為 module script 不同，請參考 [Uncaught ReferenceError: function is not defined with onclick](https://stackoverflow.com/questions/17378199/uncaught-referenceerror-function-is-not-defined-with-onclick)

    ### 參考
    * [ES6 Modules in Chrome M61+](https://medium.com/dev-channel/es6-modules-in-chrome-canary-m60-ba588dfb8ab7)
    * [ECMAScript modules in browsers](https://jakearchibald.com/2017/es-modules-in-browsers/)
    * [Real World Experience with ES6 Modules in Browsers](https://salomvary.com/es6-modules-in-browsers.html)
---