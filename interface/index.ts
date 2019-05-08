import { RouterProps as Router } from 'next/router'
import { ApiInstance as Api, NextApiContext } from "~/api"

export interface Context extends NextApiContext {}
export interface ApiProps {
    api: Api
}
export interface RouterProps {
    router: Router
}