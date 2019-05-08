import { RouterProps as Router1, SingletonRouter, WithRouterProps } from 'next/router'
import { ApiInstance as Api, NextApiContext } from "~/api"
// import { SingletonRouter } from "next/router";

export interface Context extends NextApiContext {}
export interface ApiProps {
    api: Api
}
export interface RouterProps1 {
    router: Router1
}