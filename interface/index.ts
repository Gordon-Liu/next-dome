import { SingletonRouter } from 'next/router'
import { NextContext } from 'next'
import { NextAppContext } from 'next/app'
import { Store } from 'redux'

import { ApiInstance as Api } from "~/api"

/*
 * 挂载 NextContext
 */
export interface Context extends NextContext {
    api: Api
    store: Store
}

export interface AppContext extends NextAppContext {
    ctx: Context
}

export interface ApiProps {
    api: Api
}
export interface RouterProps {
    router: SingletonRouter
}

export type RouterPropsType<T> = T & RouterProps