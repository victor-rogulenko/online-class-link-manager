// Turn string into Number or leave as it was
export default function toNum (str) {
  var num = Number(str)
  if (isNaN(num)) {
    return(str)
  } else {
    return(num)
  }
}
