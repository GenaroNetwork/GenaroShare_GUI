import Vue from 'vue'
import VueI18n from 'vue-i18n'
import localeEn from 'element-ui/lib/locale/lang/en'
import localeZh from 'element-ui/lib/locale/lang/zh-CN'
import sharerEn from './sharer-en'
import sharerZh from './sharer-zh-CN'

Vue.use(VueI18n)

const messages = {
    en: Object.assign({}, sharerEn, localeEn),
    zh: Object.assign({}, sharerZh, localeZh)
}

let defaultLang = 'en'
const path = require('path')
const os = require('os')
const fs = require('fs')

const configDir = path.join(os.homedir(), '.sharer')
if (!fs.existsSync(configDir))
    fs.mkdirSync(configDir)

const langConfigFile = path.join(configDir, 'language.json')
if (fs.existsSync(langConfigFile))
    defaultLang = JSON.parse(fs.readFileSync(langConfigFile, 'utf8')).language
else {
    if (typeof localStorage !== 'undefined'
        && (localStorage.language === 'zh' || localStorage.language === 'en'))
        defaultLang = localStorage.language
    writeLangJsonConfigFile(defaultLang)
}

let localeMessages = {
    locale: defaultLang,
    messages
}
const i18n = new VueI18n(localeMessages)

export function writeLangJsonConfigFile(lang) {
    let langJson = { language: lang }
    fs.writeFileSync(langConfigFile, JSON.stringify(langJson), 'utf8')
}
export { localeMessages }
export default i18n;