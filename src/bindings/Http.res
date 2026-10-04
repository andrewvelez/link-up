/**
 * @author Andrew Velez
 * @license MIT
 * @description Web request and response bindings shared by the server and tests.
 */
type request
type response
type headers
type stream
type url

type responseOptions = {status?: int, headers?: Dict.t<string>}
type requestOptions = {method?: string, redirect?: string, headers?: Dict.t<string>}

@new external request: (string, requestOptions) => request = "Request"
@new external response: ('body, responseOptions) => response = "Response"
@new external url: (string, string) => url = "URL"
@send external text: response => promise<string> = "text"
@send external header: (headers, string) => Nullable.t<string> = "get"
@get external status: response => int = "status"
@get external headers: response => headers = "headers"
@get external href: url => string = "href"
@val external fetch: (string, requestOptions) => promise<response> = "fetch"
