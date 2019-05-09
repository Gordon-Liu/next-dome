import { SingletonRouter } from 'next/router'
import { ApiInstance as Api, NextApiContext } from "~/api"

export interface Context extends NextApiContext {}
export interface ApiProps {
    api: Api
}
export interface RouterProps {
    router: SingletonRouter
}

export type RouterPropsType<T> = T & RouterProps