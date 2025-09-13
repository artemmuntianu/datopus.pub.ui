import { OneMinuteMs } from "./app/consts";
import { OrgType } from "./app/enums";

type CallBackFunc<U> = () => U;

export const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

export const forkByOrgType = (orgType: OrgType, orgTypeB2B: CallBackFunc<any>, orgTypeB2C: CallBackFunc<any>) => {
    switch (orgType) {
        case OrgType.b2b: return orgTypeB2B();
        case OrgType.b2c: return orgTypeB2C();
        default: console.error(`OrgType "${orgType}" is unexpected in the function forkByOrgType`);
    }
};

export const localDateToUtc = (date: Date) => new Date(date.getTime() + date.getTimezoneOffset() * OneMinuteMs);

export const utcDateToLocal = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * OneMinuteMs);