/**
 * @author Andrew Velez
 * @license MIT
 * @description Authentication remains unimplemented; cookie presence never authorizes a user.
 */
@unboxed type state =
  | @as("unknown") Unknown | @as("known") Known | @as("authenticated") Authenticated

let getAuthenticationState = async (_request: Http.request): state => Unknown
