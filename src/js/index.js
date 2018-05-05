import AJAX from './ajax';
import I18N, { REGIONS } from './i18n';
import CONSTANTS from './constants';

// 使用 import 導入 css 檔，再由 style-loader 注入到 html.head
import style from '../sass/main.scss';

const game = 'League of Legends';
const queryLimit = 20;
let queryIndex = 0;
let cachedRegion;
let cachedRegionId;
let isLoading = false;


// FIXME: fdafds
const twitchAPI = {
  baseURL: 'https://api.twitch.tv/kraken/streams/',
  headers: {
    'client-id': '2ptsb12qaqxechb7k5u7332ranqezr'
  },
  getURI (gameName, limit, offset, lan) {
    return `${this.baseURL}?game=${gameName}&limit=${limit}&offset=${offset}&language=${lan}`;
  }
};

function getTwitchData (cb) {
  AJAX(twitchAPI.getURI(game, queryLimit, queryIndex, cachedRegionId), 'GET', twitchAPI.headers)
    .then((result) => {
      cb(null, JSON.parse(result));
    })
    .catch(err => cb(err));
}

const genItem = (data) => {
  const result = `<div class="item">
        <div class="preview">
            <img src="${data.preview.medium}" onload="this.style.opacity=1" />
        </div>
        <div class="content">
            <div class="avatar">
                <img src="${data.channel.logo}" onload="this.style.opacity=1" />
            </div>
            <div class="desc">
                <p>${data.channel.status}</p>
                <p>${data.channel.display_name}</p>
            </div>
        </div>
    </div>
    `;
  return result;
};

function loadTwitchData () {
  getTwitchData((err, data) => {
    if (err) {
      return console.log(err);
    }

    const { streams } = data;

    const lists = window.document.querySelector('.list');
    streams.forEach((stream) => {
      lists.innerHTML += genItem(stream);
      queryIndex += 1;
    });
    streams.forEach((stream) => {
      lists.innerHTML += genItem(stream);
      queryIndex += 1;
    });
    isLoading = false;
    return true;
  });
}

function getScrollXY () {
  let x = 0;
  let y = 0;

  if (typeof (window.pageYOffset) === 'number') {
    // Netscape compliant
    y = window.pageYOffset;
    x = window.pageXOffset;
  } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
    // DOM compliant
    y = document.body.scrollTop;
    x = document.body.scrollLeft;
  } else if (document.documentElement &&
    (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
    // IE6 standards compliant mode
    y = document.documentElement.scrollTop;
    x = document.documentElement.scrollLeft;
  }
  return { x, y };
}

function getDocHeight () {
  return Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.body.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

function isReachBottom (prefix = 0) {
  const scrollHeight = getScrollXY().y;
  const windowInnerHeight = window.innerHeight;
  const bodyHeight = getDocHeight();
  return bodyHeight - (windowInnerHeight + scrollHeight) <= prefix;
}

const title = document.querySelector('.title');
const lang = document.querySelector('.lang');

const updateLangBtns = (regionId) => {
  lang.childNodes.forEach((child) => {
    const childClasses = child.classList;
    if (childClasses.contains(`btn-${regionId}`)) {
      childClasses.add('lang-selected');
    } else {
      childClasses.remove('lang-selected');
    }
  });
};

const changeLanguage = (regionId = CONSTANTS.REGION_ID.EN) => {
  const region = REGIONS[regionId];
  if (isLoading || (region === cachedRegion)) {
    window.event.preventDefault();
    return false;
  }
  isLoading = true;
  title.textContent = I18N.getLocaleString(CONSTANTS.LOCALE.TITLE, region);

  // reset items & props of Twitch
  cachedRegion = region;
  cachedRegionId = regionId;
  queryIndex = 0;
  document.querySelector('.list').innerHTML = '';
  updateLangBtns(regionId);
  setTimeout(loadTwitchData, 50);
  return true;
};

const initI18N = () => {
  lang.innerHTML = '';
  Object.keys(REGIONS).forEach((key) => {
    const div = document.createElement('div');
    const text = document.createTextNode(I18N.getLocaleString(CONSTANTS.LOCALE.LANG, REGIONS[key]));
    div.appendChild(text);
    lang.appendChild(div);
    div.addEventListener('click', () => changeLanguage(key));
    div.classList.add(`btn-${key}`);
  });
};

window.addEventListener('load', () => {
  initI18N();
  changeLanguage();
});
window.addEventListener('scroll', () => {
  if (!isLoading && isReachBottom(300)) {
    isLoading = true;
    console.log(`offset=${queryIndex}`);
    loadTwitchData();
  }
});
