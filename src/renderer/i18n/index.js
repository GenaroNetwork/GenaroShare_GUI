import Vue from 'vue';
import VueI18n from 'vue-i18n';
import localeEn from 'element-ui/lib/locale/lang/en';
import localeZh from 'element-ui/lib/locale/lang/zh-CN';
import sharerEn from './sharer-en';
import sharerZh from './sharer-zh-CN';

const path = require('path'),
      os = require('os'),
      fs = require('fs')

Vue.use(VueI18n);

const messages = {
    en: Object.assign({}, sharerEn, localeEn),
    zh: Object.assign({}, sharerZh, localeZh)
};

let defaultLang = 'en';

const configDir = path.join(os.homedir(), '.sharer');

function createConfigDir(){
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }
}

createConfigDir();
const langConfigFile = path.join(configDir, 'language.json');
if (fs.existsSync(langConfigFile)) {
    try {
        defaultLang = JSON.parse(fs.readFileSync(langConfigFile, 'utf8')).language;
    }
    catch(e) {
        defaultLang = 'en';
    }
}
    
let localeMessages = {
    locale: defaultLang,
    messages
}
const i18n = new VueI18n(localeMessages);

export function writeLangJsonConfigFile(lang) {
    let langJson = { language: lang };
    createConfigDir();
    fs.writeFileSync(langConfigFile, JSON.stringify(langJson), 'utf8');
    localeMessages.locale = lang;
}
export { localeMessages };
export default i18n;