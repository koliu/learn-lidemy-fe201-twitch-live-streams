import EN from "./i18n/en";
import ZH_TW from "./i18n/zh_TW";
import CONSTANTS from "./constants";

const REGIONS = {};
REGIONS[CONSTANTS.REGION_ID.EN] = EN;
REGIONS[CONSTANTS.REGION_ID.ZH_TW] = ZH_TW;

const getLocaleString = (id, region) => {
    if (!region || Object.values(REGIONS).indexOf(region) < 0) {
        return REGIONS[CONSTANTS.REGION_ID.EN][id];
    }

    return region[id];
}

export default { getLocaleString };
export { REGIONS };