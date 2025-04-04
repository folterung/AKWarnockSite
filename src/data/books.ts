export interface Book {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  amazonLink: string;
  synopsis: string;
}

export const books: Book[] = [
  {
    id: 'spirit-blessed-chronicles',
    title: 'Spirit Blessed Chronicles: A New Legacy',
    description: 'Explore the Spirit Blessed Chronicles by A.K. Warnock',
    coverImage: '/images/book-cover.jpg',
    amazonLink: 'https://www.amazon.com/Spirit-Blessed-Chronicles-New-Legacy/dp/B0DVLRWFXX/ref=sr_1_1?crid=30KE948OKEH0J&dib=eyJ2IjoiMSJ9.q7vg7WsFgpMOFq9kDWziXueCkGCvFElYCwE-9d6UcFye05KN4XfK3xj_xy679lZZamYubdymOTHIGd_frdG1TRUIWhSTkvXOPTcgDHoFHr-LuIGazlIyycc0_RvkSytdKtG5T8jRbWU-gpE79uyO5Q._iFqcB63pTRdQWGpT1W1IQWMEAttWGGCBVfTvfMuzh0&dib_tag=se&keywords=spirit+blessed+chronicles+a+new+legacy&qid=1743088011&sprefix=spirit+blessed+%2Caps%2C89&sr=8-1',
    synopsis: `When 11-year-old Winslow "Wiki" Kinney and his best friend Harper "Hap" Jones stumble upon an ancient box in the woods, they unknowingly set off a chain of events that will change their lives forever. Strange abilities awaken in Wiki, mysterious figures begin to appear, and long-buried secrets about his missing father come to light.

The more they uncover, the less things make sense. Why was the box hidden? Who else is searching for it? And most importantly—what has Wiki awakened?`
  }
]; 