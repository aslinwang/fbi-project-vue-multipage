import cgi from '../helpers/cgi'

// see: https://github.com/mzabriskie/axios
// cgi.http.get(url)
// cgi.http.post(url, data)

// cgi.handleCGIReturn(response)

export default {
  all() {
    return cgi.http.get(`${cgi.root}/api/city`)
      .then(response => cgi.handleCGIReturn(response))
  },
  login() {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 1500)
      // test error
      // setTimeout(() => reject('An error occurred.'), 1500)
    })
  }
}