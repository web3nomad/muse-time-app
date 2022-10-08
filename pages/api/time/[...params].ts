// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { queryOnChainItemId, ResourceTypes } from '@/lib/arweave'
import type { TopicData, ProfileData } from '@/lib/arweave'
import { controllerContract, nftContract } from '@/lib/ethereum/public'
import type { TimeTokenData, TimeTroveData } from '@/lib/ethereum/types'

// const generateSVG = (topic: TopicData, timeToken: TimeTokenData) => `
// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
//   <rect width="600" height="800" rx="15" ry="15" stroke="#292929" stroke-width="10" stroke-linecap="round" fill="#E0DDD6"/>
//   <path transform="translate(36,40)" d="M10.88 13.48C10.96 15.64 12.64 17.32 14.8 17.32C16.88 17.32 18.64 15.64 18.64 13.48C18.64 11.32 16.88 9.64 14.8 9.64C14.16 9.64 13.6 9.8 13.04 10.04C14 8.04 15.36 6.36 16.4 5.4L15.28 4.76C13.84 6.04 10.88 9.24 10.88 13.48ZM0.4 13.48C0.4 15.64 2.16 17.32 4.24 17.32C6.4 17.32 8.16 15.64 8.16 13.48C8.16 11.32 6.4 9.64 4.24 9.64C3.68 9.64 3.04 9.8 2.56 10.04C3.44 8.04 4.88 6.36 5.84 5.4L4.72 4.76C3.28 6.04 0.4 9.24 0.4 13.48ZM23.5363 11.16C25.2163 8.04 27.6163 5.96 30.8163 5.96H42.7363V57.08C42.7363 60.2 41.1363 62.68 38.8163 63H56.4163C54.0963 62.68 52.4963 60.2 52.4963 57.08V5.96H64.4163C67.6163 5.96 70.0163 8.04 71.6963 11.16H72.1763L69.6163 4.28H25.6163L23.0563 11.16H23.5363ZM61.025 21.32C63.105 21.56 64.545 23.8 64.545 26.52V57.72C64.545 60.52 63.105 62.68 61.025 63H76.625C74.545 62.68 73.105 60.52 73.105 57.72V26.52C73.105 23.8 74.545 21.56 76.625 21.32H66.385C72.065 19.96 74.625 15.48 74.625 11.64C74.545 10.44 73.985 7 70.385 7C69.585 7 68.865 7.24 68.225 7.72C69.985 3.48 74.385 1.4 78.705 1.4C87.905 1.4 90.385 9 90.385 15.96C90.385 19.4 87.505 21.32 82.785 21.32H79.265C81.345 21.56 82.785 23.8 82.785 26.52V57.72C82.785 60.52 81.345 62.68 79.265 63H94.865C92.785 62.68 91.345 60.52 91.345 57.72V34.04C91.985 26.28 95.265 23.08 98.065 23.08C101.505 23.08 102.385 27.48 102.385 32.52V57.72C102.385 60.52 101.025 62.68 98.945 63H114.545C112.465 62.68 111.025 60.52 111.025 57.72V34.2C111.585 26.28 114.945 23.08 117.745 23.08C121.185 23.08 122.065 27.48 122.065 32.52V57.72C122.065 60.52 120.625 62.68 118.545 63H134.145C132.065 62.68 130.705 60.52 130.705 57.72V32.76C130.705 23.4 125.345 20.12 120.385 20.12C116.385 20.12 112.225 23.32 110.865 29.96C109.905 22.76 105.185 20.12 100.785 20.12C96.785 20.12 92.785 22.92 91.345 29.56V15.64C91.345 7.16 87.425 0.599998 78.225 0.599998C72.305 0.599998 66.385 4.84 66.385 11.16C66.385 13.48 68.145 15.32 70.385 15.32C71.425 15.32 72.385 14.92 73.105 14.2C71.185 19.88 65.345 21.32 61.025 21.32ZM137.725 42.12C137.725 54.6 145.965 64.2 157.885 64.2C165.165 64.2 169.965 60.84 171.885 52.6H170.605C169.405 57.16 166.605 62.12 161.245 62.12C156.925 62.12 152.525 58.68 149.565 53.32C146.365 46.36 151.325 38.92 159.885 37.8C168.605 36.68 171.725 34.28 171.725 30.36C171.725 25.72 166.205 20.12 156.605 20.12C146.205 20.12 137.725 28.6 137.725 42.12ZM157.885 21.16C164.045 21.16 166.285 25.8 166.285 29C166.285 32.36 164.445 35.4 157.965 37C151.725 38.52 147.405 43.16 147.325 48.28C147.245 48.04 147.165 47.72 147.085 47.48C143.005 35.32 148.685 21.16 157.885 21.16ZM199.389 26.52V57.72C199.389 60.52 197.949 62.68 195.869 63H211.469C209.389 62.68 207.949 60.52 207.949 57.72V26.52C207.949 23.8 209.389 21.56 211.469 21.32H201.229C206.909 19.96 209.469 15.48 209.469 11.64C209.469 10.44 208.829 7 205.229 7C202.989 7 201.229 8.84 201.229 11.16C201.229 13.48 202.989 15.32 205.229 15.32C206.269 15.32 207.229 14.92 207.949 14.2C206.029 19.88 200.189 21.32 195.869 21.32C197.949 21.56 199.389 23.8 199.389 26.52ZM214.834 51.08C214.834 59.16 220.034 64.2 228.434 64.2C233.954 64.2 243.794 60.84 243.794 52.44C243.794 39.16 223.074 37 223.074 28.2C223.074 23.16 227.234 21 230.914 21C238.274 21 241.474 28.68 240.114 34.76L240.754 35C241.474 32.92 242.834 31.32 244.514 29.08C244.514 26.12 239.154 20.12 230.754 20.12C224.594 20.12 216.514 22.92 216.514 31C216.514 43.72 236.754 45.48 236.754 55.64C236.754 60.36 232.674 63.16 227.794 63.16C219.714 63.16 218.674 53.4 222.434 48.2L216.674 44.68C215.714 45.96 214.834 48.44 214.834 51.08ZM268.525 63H284.125C282.045 62.68 280.605 60.52 280.605 57.72V34.2C281.245 26.28 284.525 23.08 287.325 23.08C290.845 23.08 291.645 27.48 291.645 32.52V57.72C291.645 60.52 290.285 62.68 288.205 63H303.805C301.725 62.68 300.285 60.52 300.285 57.72V34.2C300.845 26.28 304.205 23.08 307.005 23.08C310.445 23.08 311.325 27.48 311.325 32.52V57.72C311.325 60.52 309.965 62.68 307.885 63H323.485C321.325 62.68 319.965 60.52 319.965 57.72V32.76C319.965 23.4 314.685 20.12 309.645 20.12C305.725 20.12 301.485 23.32 300.125 29.96C299.165 22.76 294.445 20.12 290.045 20.12C286.045 20.12 282.045 22.92 280.605 29.56V21.32H268.525C270.605 21.56 272.045 23.8 272.045 26.52V57.72C272.045 60.52 270.605 62.68 268.525 63ZM327.022 42.12C327.022 54.28 335.022 64.2 344.942 64.2C354.862 64.2 362.862 54.28 362.862 42.12C362.862 29.96 354.862 20.12 344.942 20.12C335.022 20.12 327.022 29.96 327.022 42.12ZM341.022 21.64C341.262 21.56 341.582 21.56 341.822 21.56C346.862 21.56 352.302 29.64 354.382 40.36C356.542 51.64 354.062 61.56 348.862 62.6C348.542 62.68 348.302 62.68 347.982 62.68C343.022 62.68 337.502 54.6 335.502 43.96C333.342 32.68 335.822 22.68 341.022 21.64ZM366.884 63H382.484C380.404 62.68 378.964 60.52 378.964 57.72V34.2C379.604 26.28 384.244 23.08 388.164 23.08C392.964 23.08 396.564 27.48 396.564 32.52V57.72C396.564 60.52 395.124 62.68 393.044 63H408.644C406.564 62.68 405.124 60.52 405.124 57.72V32.76C405.124 25.24 399.364 20.12 391.444 20.12C386.724 20.12 380.724 22.84 378.964 29.8V21.32H366.884C368.964 21.56 370.404 23.8 370.404 26.52V57.72C370.404 60.52 368.964 62.68 366.884 63ZM412.256 42.12C412.256 54.6 420.496 64.2 432.416 64.2C439.696 64.2 444.496 60.84 446.416 52.6H445.136C443.936 57.16 441.136 62.12 435.776 62.12C431.456 62.12 427.056 58.68 424.096 53.32C420.896 46.36 425.856 38.92 434.416 37.8C443.136 36.68 446.256 34.28 446.256 30.36C446.256 25.72 440.736 20.12 431.136 20.12C420.736 20.12 412.256 28.6 412.256 42.12ZM432.416 21.16C438.576 21.16 440.816 25.8 440.816 29C440.816 32.36 438.976 35.4 432.496 37C426.256 38.52 421.936 43.16 421.856 48.28C421.776 48.04 421.696 47.72 421.616 47.48C417.536 35.32 423.216 21.16 432.416 21.16ZM452.06 26.52L459.5 53.16C465.66 55.32 474.06 61 474.06 68.2C474.06 73.32 470.7 77.8 464.06 77.8C453.26 77.8 453.74 63.56 454.38 61.8L453.66 61.4C452.7 63.16 449.9 66.76 447.34 68.68C449.34 73.08 456.06 78.92 465.58 78.92C477.02 78.92 482.7 74.44 482.7 67.8C482.7 63.72 479.66 58.28 469.26 55.88C471.34 46.84 481.1 38.68 481.1 26.92C481.1 24.44 480.78 22.92 480.14 21.24H474.22C477.58 24.28 478.7 28.12 478.7 31.08C478.7 38.36 471.02 45.96 468.46 54.36L460.7 26.52C459.9 23.64 460.62 21.56 462.7 21.32H447.1C449.18 21.56 451.18 23.4 452.06 26.52ZM488.168 63.32C490.328 63.32 492.088 61.56 492.088 59.48C492.088 57.32 490.328 55.64 488.168 55.64C486.088 55.64 484.328 57.32 484.328 59.48C484.328 61.56 486.088 63.32 488.168 63.32ZM518.614 8.68C518.614 10.76 520.374 12.52 522.534 12.52C523.094 12.52 523.734 12.36 524.214 12.12C523.334 14.04 521.894 15.72 520.934 16.76L522.054 17.4C523.494 16.04 526.374 12.92 526.374 8.68C526.374 6.52 524.614 4.76 522.534 4.76C520.374 4.76 518.534 6.52 518.614 8.68ZM508.134 8.68C508.134 10.76 509.894 12.52 511.974 12.52C512.614 12.52 513.174 12.36 513.734 12.12C512.774 14.04 511.414 15.72 510.374 16.76L511.494 17.4C512.934 16.04 515.894 12.92 515.894 8.68C515.814 6.52 514.134 4.76 511.974 4.76C509.894 4.76 508.134 6.52 508.134 8.68Z" fill="#292929"/>
//   <text style="font-size:30px;"><tspan class="n" text-anchor="middle" x="50%" y="20%">${topic.name}</tspan></text>
// </svg>
// `

const generateSVG = (profile: ProfileData, topic: TopicData, timeToken: TimeTokenData, tokenOwner: string) => `
<svg width="450" height="520" viewBox="0 0 450 520" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .h1{font-family:sans-serif;font-size:24px;fill:#292929;}
      .h2{font-family:sans-serif;font-size:20px;fill:#292929;}
      .p{font-family:sans-serif;font-size:14px;fill:#292929;}
      .s{font-family:sans-serif;font-size:12px;fill:#999999;}
    </style>
  </defs>
  <rect x="4" y="4" width="450" height="520" fill="#292929" shape-rendering="crispEdges"/>
  <rect x="0" y="0" width="446" height="516" fill="#F1F1EF" stroke="#292929" stroke-width="2" shape-rendering="crispEdges"/>
  <path d="M193.141 62.116H192.077C191.811 63.334 190.929 64.132 189.683 64.132C189.025 64.132 188.395 63.88 187.961 63.432C187.331 62.788 187.261 62.102 187.261 60.016C187.261 57.93 187.331 57.244 187.961 56.6C188.395 56.152 189.025 55.9 189.683 55.9C190.929 55.9 191.783 56.698 192.049 57.916H193.141C192.805 56.04 191.475 54.948 189.683 54.948C188.703 54.948 187.807 55.312 187.135 55.984C186.197 56.922 186.197 57.902 186.197 60.016C186.197 62.13 186.197 63.11 187.135 64.048C187.807 64.72 188.703 65.084 189.683 65.084C191.461 65.084 192.819 63.992 193.141 62.116ZM202.461 65L200.095 60.478C201.383 60.212 202.265 59.26 202.265 57.804C202.265 56.082 201.047 55.032 199.311 55.032H195.489V65H196.553V60.576H198.947L201.215 65H202.461ZM201.201 57.818C201.201 59.036 200.375 59.638 199.213 59.638H196.553V55.984H199.213C200.375 55.984 201.201 56.6 201.201 57.818ZM210.864 65V64.048H205.74V60.45H210.108V59.498H205.74V55.984H210.864V55.032H204.676V65H210.864ZM220.015 65L216.361 55.032H215.465L211.797 65H212.931L213.729 62.746H218.083L218.881 65H220.015ZM217.775 61.822H214.051L215.927 56.558L217.775 61.822ZM226.606 55.984V55.032H219.774V55.984H222.658V65H223.722V55.984H226.606ZM234.653 65V64.048H229.529V60.45H233.897V59.498H229.529V55.984H234.653V55.032H228.465V65H234.653ZM243.776 59.904C243.776 58.518 243.832 56.992 242.796 55.956C242.194 55.354 241.312 55.032 240.276 55.032H236.86V65H240.276C241.312 65 242.194 64.678 242.796 64.076C243.832 63.04 243.776 61.29 243.776 59.904ZM242.712 59.904C242.712 61.122 242.74 62.606 242.054 63.32C241.536 63.852 240.864 64.048 240.094 64.048H237.924V55.984H240.094C240.864 55.984 241.536 56.18 242.054 56.712C242.74 57.426 242.712 58.686 242.712 59.904ZM256.612 62.242C256.612 61.052 255.94 60.226 254.988 59.876C255.828 59.568 256.458 58.742 256.458 57.692C256.458 56.026 255.254 55.032 253.518 55.032H249.766V65H253.644C255.408 65 256.612 64.048 256.612 62.242ZM255.548 62.214C255.548 63.334 254.778 64.048 253.546 64.048H250.83V60.394H253.546C254.778 60.394 255.548 61.094 255.548 62.214ZM255.394 57.706C255.394 58.896 254.54 59.442 253.434 59.442H250.83V55.984H253.434C254.54 55.984 255.394 56.516 255.394 57.706ZM264.76 55.032H263.612L261.288 59.806L258.936 55.032H257.788L260.756 60.884V65H261.82V60.884L264.76 55.032Z" fill="#292929"/>
  <text class="h1"><tspan text-anchor="middle" x="50%" y="100">${profile.name}</tspan></text>
  <path xmlns="http://www.w3.org/2000/svg" d="M198.528 148.016C198.528 145.902 198.528 144.922 197.59 143.984C196.918 143.312 196.036 142.948 195.042 142.948C194.048 142.948 193.166 143.312 192.494 143.984C191.556 144.922 191.556 145.902 191.556 148.016C191.556 150.13 191.556 151.11 192.494 152.048C193.166 152.72 194.048 153.084 195.042 153.084C196.036 153.084 196.918 152.72 197.59 152.048C198.528 151.11 198.528 150.13 198.528 148.016ZM197.464 148.016C197.464 150.102 197.394 150.774 196.764 151.418C196.33 151.866 195.7 152.132 195.042 152.132C194.384 152.132 193.754 151.866 193.32 151.418C192.69 150.774 192.62 150.102 192.62 148.016C192.62 145.93 192.69 145.258 193.32 144.614C193.754 144.166 194.384 143.9 195.042 143.9C195.7 143.9 196.33 144.166 196.764 144.614C197.394 145.258 197.464 145.93 197.464 148.016ZM211.193 143.032H210.059L208.113 151.068L205.915 143.032H204.963L202.765 151.068L200.819 143.032H199.685L202.233 153H203.227L205.439 145.02L207.651 153H208.645L211.193 143.032ZM220.216 153V143.032H219.152V150.998L213.86 143.032H212.852V153H213.916V145.006L219.208 153H220.216ZM229.294 153V152.048H224.17V148.45H228.538V147.498H224.17V143.984H229.294V143.032H223.106V153H229.294ZM238.417 147.904C238.417 146.518 238.473 144.992 237.437 143.956C236.835 143.354 235.953 143.032 234.917 143.032H231.501V153H234.917C235.953 153 236.835 152.678 237.437 152.076C238.473 151.04 238.417 149.29 238.417 147.904ZM237.353 147.904C237.353 149.122 237.381 150.606 236.695 151.32C236.177 151.852 235.505 152.048 234.735 152.048H232.565V143.984H234.735C235.505 143.984 236.177 144.18 236.695 144.712C237.381 145.426 237.353 146.686 237.353 147.904ZM251.253 150.242C251.253 149.052 250.581 148.226 249.629 147.876C250.469 147.568 251.099 146.742 251.099 145.692C251.099 144.026 249.895 143.032 248.159 143.032H244.407V153H248.285C250.049 153 251.253 152.048 251.253 150.242ZM250.189 150.214C250.189 151.334 249.419 152.048 248.187 152.048H245.471V148.394H248.187C249.419 148.394 250.189 149.094 250.189 150.214ZM250.035 145.706C250.035 146.896 249.181 147.442 248.075 147.442H245.471V143.984H248.075C249.181 143.984 250.035 144.516 250.035 145.706ZM259.4 143.032H258.252L255.928 147.806L253.576 143.032H252.428L255.396 148.884V153H256.46V148.884L259.4 143.032Z" fill="#292929"/>
  <text class="p"><tspan text-anchor="middle" x="50%" y="175">${tokenOwner}</tspan></text>
  <path xmlns="http://www.w3.org/2000/svg" d="M180.928 215.984V215.032H174.096V215.984H176.98V225H178.044V215.984H180.928ZM183.852 225V215.032H182.788V225H183.852ZM195.279 225V215.032H194.215L191.051 222.102L187.803 215.032H186.739V225H187.803V217.426L190.575 223.432H191.485L194.215 217.426V225H195.279ZM204.357 225V224.048H199.233V220.45H203.601V219.498H199.233V215.984H204.357V215.032H198.169V225H204.357ZM217.413 225V215.032H216.349V222.998L211.057 215.032H210.049V225H211.113V217.006L216.405 225H217.413ZM226.491 215.984V215.032H220.303V225H221.367V220.604H225.735V219.652H221.367V215.984H226.491ZM234.234 215.984V215.032H227.402V215.984H230.286V225H231.35V215.984H234.234ZM245.391 215.984V215.032H238.559V215.984H241.443V225H242.507V215.984H245.391ZM253.571 220.016C253.571 217.902 253.571 216.922 252.633 215.984C251.961 215.312 251.079 214.948 250.085 214.948C249.091 214.948 248.209 215.312 247.537 215.984C246.599 216.922 246.599 217.902 246.599 220.016C246.599 222.13 246.599 223.11 247.537 224.048C248.209 224.72 249.091 225.084 250.085 225.084C251.079 225.084 251.961 224.72 252.633 224.048C253.571 223.11 253.571 222.13 253.571 220.016ZM252.507 220.016C252.507 222.102 252.437 222.774 251.807 223.418C251.373 223.866 250.743 224.132 250.085 224.132C249.427 224.132 248.797 223.866 248.363 223.418C247.733 222.774 247.663 222.102 247.663 220.016C247.663 217.93 247.733 217.258 248.363 216.614C248.797 216.166 249.427 215.9 250.085 215.9C250.743 215.9 251.373 216.166 251.807 216.614C252.437 217.258 252.507 217.93 252.507 220.016ZM262.873 217.958C262.873 216.166 261.613 215.032 259.793 215.032H256.083V225H257.147V220.898H259.793C261.613 220.898 262.873 219.75 262.873 217.958ZM261.809 217.958C261.809 219.274 260.941 219.946 259.695 219.946H257.147V215.984H259.695C260.941 215.984 261.809 216.642 261.809 217.958ZM265.965 225V215.032H264.901V225H265.965ZM275.418 222.116H274.354C274.088 223.334 273.206 224.132 271.96 224.132C271.302 224.132 270.672 223.88 270.238 223.432C269.608 222.788 269.538 222.102 269.538 220.016C269.538 217.93 269.608 217.244 270.238 216.6C270.672 216.152 271.302 215.9 271.96 215.9C273.206 215.9 274.06 216.698 274.326 217.916H275.418C275.082 216.04 273.752 214.948 271.96 214.948C270.98 214.948 270.084 215.312 269.412 215.984C268.474 216.922 268.474 217.902 268.474 220.016C268.474 222.13 268.474 223.11 269.412 224.048C270.084 224.72 270.98 225.084 271.96 225.084C273.738 225.084 275.096 223.992 275.418 222.116Z" fill="#292929"/>
  <text class="h2"><tspan text-anchor="middle" x="50%" y="255">${topic.name}</tspan></text>
  <path xmlns="http://www.w3.org/2000/svg" d="M171.503 297.958C171.503 296.166 170.243 295.032 168.423 295.032H164.713V305H165.777V300.898H168.423C170.243 300.898 171.503 299.75 171.503 297.958ZM170.439 297.958C170.439 299.274 169.571 299.946 168.325 299.946H165.777V295.984H168.325C169.571 295.984 170.439 296.642 170.439 297.958ZM180.504 305L178.138 300.478C179.426 300.212 180.308 299.26 180.308 297.804C180.308 296.082 179.09 295.032 177.354 295.032H173.532V305H174.596V300.576H176.99L179.258 305H180.504ZM179.244 297.818C179.244 299.036 178.418 299.638 177.256 299.638H174.596V295.984H177.256C178.418 295.984 179.244 296.6 179.244 297.818ZM183.783 305V295.032H182.719V305H183.783ZM193.237 302.116H192.173C191.907 303.334 191.025 304.132 189.779 304.132C189.121 304.132 188.491 303.88 188.057 303.432C187.427 302.788 187.357 302.102 187.357 300.016C187.357 297.93 187.427 297.244 188.057 296.6C188.491 296.152 189.121 295.9 189.779 295.9C191.025 295.9 191.879 296.698 192.145 297.916H193.237C192.901 296.04 191.571 294.948 189.779 294.948C188.799 294.948 187.903 295.312 187.231 295.984C186.293 296.922 186.293 297.902 186.293 300.016C186.293 302.13 186.293 303.11 187.231 304.048C187.903 304.72 188.799 305.084 189.779 305.084C191.557 305.084 192.915 303.992 193.237 302.116ZM201.773 305V304.048H196.649V300.45H201.017V299.498H196.649V295.984H201.773V295.032H195.585V305H201.773ZM215.417 305L213.891 303.166C214.535 302.396 214.801 301.374 214.815 300.114H213.807C213.793 301.234 213.653 301.78 213.247 302.396L210.699 299.33C210.937 299.162 211.441 298.826 211.441 298.826C212.071 298.392 212.547 297.846 212.547 297.048C212.547 295.858 211.623 294.948 210.377 294.948C209.103 294.948 208.179 295.844 208.179 297.034C208.179 297.93 208.767 298.616 209.257 299.204C208.165 299.932 207.101 300.688 207.101 302.186C207.101 303.922 208.319 305.084 210.251 305.084C211.847 305.084 212.785 304.286 213.191 303.908L214.087 305H215.417ZM212.589 303.18C211.735 303.95 210.979 304.146 210.237 304.146C209.005 304.146 208.137 303.348 208.137 302.158C208.137 301.024 208.991 300.464 209.845 299.876L212.589 303.18ZM211.553 297.048C211.553 297.622 211.119 297.972 210.657 298.294C210.657 298.294 210.293 298.546 210.125 298.658C209.467 297.86 209.229 297.482 209.229 297.02C209.229 296.348 209.691 295.858 210.377 295.858C211.049 295.858 211.553 296.376 211.553 297.048ZM228.217 299.904C228.217 298.518 228.273 296.992 227.237 295.956C226.635 295.354 225.753 295.032 224.717 295.032H221.301V305H224.717C225.753 305 226.635 304.678 227.237 304.076C228.273 303.04 228.217 301.29 228.217 299.904ZM227.153 299.904C227.153 301.122 227.181 302.606 226.495 303.32C225.977 303.852 225.305 304.048 224.535 304.048H222.365V295.984H224.535C225.305 295.984 225.977 296.18 226.495 296.712C227.181 297.426 227.153 298.686 227.153 299.904ZM237.539 301.71V295.032H236.475V301.626C236.475 303.138 235.509 304.132 234.053 304.132C232.597 304.132 231.645 303.138 231.645 301.626V295.032H230.581V301.71C230.581 303.698 232.037 305.084 234.053 305.084C236.069 305.084 237.539 303.698 237.539 301.71ZM247.25 305L244.884 300.478C246.172 300.212 247.054 299.26 247.054 297.804C247.054 296.082 245.836 295.032 244.1 295.032H240.278V305H241.342V300.576H243.736L246.004 305H247.25ZM245.99 297.818C245.99 299.036 245.164 299.638 244.002 299.638H241.342V295.984H244.002C245.164 295.984 245.99 296.6 245.99 297.818ZM256.409 305L252.755 295.032H251.859L248.191 305H249.325L250.123 302.746H254.477L255.275 305H256.409ZM254.169 301.822H250.445L252.321 296.558L254.169 301.822ZM263 295.984V295.032H256.168V295.984H259.052V305H260.116V295.984H263ZM265.924 305V295.032H264.86V305H265.924ZM275.405 300.016C275.405 297.902 275.405 296.922 274.467 295.984C273.795 295.312 272.913 294.948 271.919 294.948C270.925 294.948 270.043 295.312 269.371 295.984C268.433 296.922 268.433 297.902 268.433 300.016C268.433 302.13 268.433 303.11 269.371 304.048C270.043 304.72 270.925 305.084 271.919 305.084C272.913 305.084 273.795 304.72 274.467 304.048C275.405 303.11 275.405 302.13 275.405 300.016ZM274.341 300.016C274.341 302.102 274.271 302.774 273.641 303.418C273.207 303.866 272.577 304.132 271.919 304.132C271.261 304.132 270.631 303.866 270.197 303.418C269.567 302.774 269.497 302.102 269.497 300.016C269.497 297.93 269.567 297.258 270.197 296.614C270.631 296.166 271.261 295.9 271.919 295.9C272.577 295.9 273.207 296.166 273.641 296.614C274.271 297.258 274.341 297.93 274.341 300.016ZM285.281 305V295.032H284.217V302.998L278.925 295.032H277.917V305H278.981V297.006L284.273 305H285.281Z" fill="#292929"/>
  <text class="h2"><tspan text-anchor="middle" x="50%" y="335">${topic.value}</tspan></text>
  <text class="s"><tspan text-anchor="middle" x="50%" y="350">(approx. ${topic.duration})</tspan></text>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M262.022 415.428L261.022 422.828L264.801 429.278C265.062 429.708 265.062 430.279 264.801 430.708L261.021 437.139L262.022 444.539C262.112 445.049 261.911 445.569 261.482 445.879L255.541 450.389L253.651 457.64C253.531 458.13 253.13 458.53 252.621 458.64L245.39 460.51L240.921 466.47C240.601 466.87 240.111 467.1 239.571 467.02L232.14 466.01L225.72 469.8C225.52 469.94 225.26 470 225 470C224.74 470 224.481 469.94 224.28 469.8L217.83 466.01L210.43 467.02C209.92 467.1 209.4 466.87 209.08 466.47L204.61 460.51L197.38 458.64C196.869 458.53 196.47 458.13 196.35 457.64L194.459 450.389L188.489 445.879C188.059 445.569 187.859 445.049 187.919 444.539L188.979 437.139L185.199 430.708C184.939 430.279 184.939 429.708 185.199 429.278L188.979 422.828L187.919 415.428C187.859 414.908 188.059 414.398 188.489 414.078L194.459 409.608L196.35 402.348C196.47 401.858 196.87 401.458 197.36 401.348L204.61 399.457L209.08 393.487C209.4 393.057 209.92 392.857 210.43 392.917L217.83 393.977L224.28 390.187C224.71 389.938 225.291 389.938 225.72 390.187L232.141 393.977L239.571 392.917C240.081 392.857 240.6 393.057 240.921 393.487L245.391 399.457L252.641 401.348C253.131 401.458 253.531 401.858 253.651 402.348L255.542 409.608L261.482 414.078C261.912 414.398 262.112 414.908 262.022 415.428ZM192.001 429.998C192.001 448.198 206.801 462.999 225.001 462.999C243.202 462.999 258.002 448.198 258.002 429.998C258.002 411.797 243.202 396.997 225.001 396.997C206.801 396.997 192.001 411.797 192.001 429.998ZM225.001 461.999C242.675 461.999 257.002 447.671 257.002 429.998C257.002 412.324 242.675 397.997 225.001 397.997C207.328 397.997 193.001 412.324 193.001 429.998C193.001 447.671 207.328 461.999 225.001 461.999Z" fill="#A6BBCC"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M224.495 424.632H220.961C220.147 424.632 219.272 424.208 219.68 422.723C220.183 420.888 222.593 419.648 224.495 419.648C226.396 419.648 228.806 420.888 229.31 422.723C229.718 424.208 228.842 424.632 228.028 424.632H224.495ZM210.522 424.794C209.981 424.79 209.437 424.78 208.906 424.78V425.557H240.083V424.78C239.552 424.78 239.009 424.79 238.467 424.794H237.878C236.812 424.786 235.772 424.725 234.871 424.478C232.709 423.885 232.458 422.768 231.37 421.177C230.102 419.325 227.932 417.02 224.495 417.02C221.057 417.02 218.887 419.324 217.619 421.178C216.531 422.768 216.28 423.885 214.118 424.478C213.217 424.726 212.178 424.786 211.111 424.794L210.522 424.794ZM229.245 426.483H231.388C231.388 427.933 229.744 432.608 224.495 432.608C219.244 432.608 217.602 427.933 217.602 426.483H219.744C219.744 427.393 220.877 430.539 224.495 430.539C228.113 430.539 229.245 427.393 229.245 426.483H229.245Z" fill="#292929"/>
  <path d="M201.632 443.169H203.088V439.564L205.356 441.842L207.634 439.564V443.169H209.08V436.385L205.356 439.841L201.642 436.385L201.632 443.169Z" fill="#292929"/>
  <path d="M212.712 443.268C214.207 443.268 215.346 442.169 215.346 440.604V437.871H213.96V440.604C213.96 441.387 213.445 441.882 212.712 441.882C211.969 441.882 211.464 441.387 211.464 440.604V437.871H210.077V440.604C210.077 442.169 211.206 443.268 212.712 443.268Z" fill="#292929"/>
  <path d="M215.953 442.674C218.964 444.16 220.915 443.258 220.915 441.595C220.915 439.851 217.518 440.02 217.548 439.287C217.578 438.623 219.182 438.564 220.232 439.376L220.797 438.425C218.836 437.128 216.231 437.455 216.102 439.208C216.003 441.218 219.479 440.901 219.479 441.654C219.479 442.516 217.677 442.228 216.439 441.525L215.953 442.674Z" fill="#292929"/>
  <path d="M224.153 443.268C225.124 443.268 225.985 443.031 226.52 442.426L225.47 441.624C225.292 441.872 224.658 442.04 224.292 442.03C223.618 442.03 223.054 441.575 222.984 441.099H226.52C227.015 439.118 225.787 437.732 224.024 437.722C222.41 437.712 221.469 439.059 221.469 440.485C221.469 441.852 222.549 443.268 224.153 443.268ZM222.975 439.901C222.975 439.475 223.341 438.94 224.074 438.94C224.926 438.94 225.213 439.544 225.163 439.901H222.975Z" fill="#292929"/>
  <path d="M227.819 443.169H229.275V437.771H231.018V436.385H226.076V437.771H227.819V443.169Z" fill="#292929"/>
  <path d="M232.014 437.385C232.42 437.385 232.747 437.029 232.747 436.642C232.747 436.246 232.42 435.909 232.014 435.909C231.618 435.909 231.281 436.246 231.281 436.642C231.281 437.029 231.618 437.385 232.014 437.385ZM231.35 443.169H232.668V437.871H231.35V443.169Z" fill="#292929"/>
  <path d="M233.887 443.169H235.273V440.139C235.273 439.594 235.531 439.128 236.066 439.128C236.6 439.128 236.848 439.594 236.848 440.139V443.169H238.235V440.139C238.235 439.594 238.492 439.128 239.027 439.128C239.562 439.128 239.809 439.594 239.809 440.139V443.169H241.196V440.139C241.196 438.762 240.433 437.742 239.027 437.742C238.393 437.742 237.868 437.989 237.541 438.366C237.224 437.989 236.699 437.742 236.066 437.742C234.659 437.742 233.887 438.762 233.887 440.139V443.169Z" fill="#292929"/>
  <path d="M244.88 443.268C245.851 443.268 246.712 443.031 247.247 442.426L246.197 441.624C246.019 441.872 245.385 442.04 245.019 442.03C244.345 442.03 243.781 441.575 243.711 441.099H247.247C247.742 439.118 246.514 437.732 244.751 437.722C243.137 437.712 242.196 439.059 242.196 440.485C242.196 441.852 243.275 443.268 244.88 443.268ZM243.701 439.901C243.701 439.475 244.068 438.94 244.801 438.94C245.652 438.94 245.94 439.544 245.89 439.901H243.701Z" fill="#292929"/>
</svg>
`

function generateTokenImage(profile: ProfileData, topic: TopicData, timeToken: TimeTokenData, tokenOwner: string) {
  const svg = generateSVG(profile, topic, timeToken, tokenOwner)
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

type AttributeData = {
  trait_type: string,
  value: string|number
}

type TimeTokenMetadata = {
  name: string,
  description: string,
  image: string,
  external_url: string,
  attributes: AttributeData[],
}

const findProfile = async (topicOwner: string): Promise<ProfileData> => {
  const timeTrove: TimeTroveData = await controllerContract.timeTroveOf(topicOwner)
  const { arOwnerAddress } = timeTrove
  const arId = await queryOnChainItemId({
    arOwnerAddress: arOwnerAddress,
    resourceId: '',
    resourceType: ResourceTypes.PROFILE,
    resourceOwner: topicOwner,
  })
  const profile: ProfileData = await fetch(`https://arseed.web3infra.dev/${arId}`).then(res => res.json())
  return profile
}

async function findTopic(topicSlug: string, arId: string): Promise<TopicData|null> {
  const url = `https://arseed.web3infra.dev/${arId}`
  try {
    const topics: TopicData[] = await fetch(url).then(res => res.json())
    const topic = topics.find(({ id }) => id === topicSlug)
    return topic ?? null
  } catch(err) {
    console.log(err)
    return null
  }
}

async function findTimeToken(tokenId: number): Promise<TimeTokenData> {
  const timeToken: TimeTokenData = await controllerContract.timeTokenOf(tokenId)
  return timeToken
}

const handler = async function(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query.params as string[]
  if (params.length !== 3) {
    res.status(404).end()
    return
  }
  const [tokenId, topicSlug, arId] = params
  const [tokenOwner, topic, timeToken]: [
    string, TopicData|null, TimeTokenData
  ] = await Promise.all([
    nftContract.ownerOf(+tokenId),
    findTopic(topicSlug, arId),
    findTimeToken(+tokenId),
  ])
  if (!topic) {
    res.status(404).end()
    return
  }
  const profile = await findProfile(timeToken['topicOwner'])
  const attributes = [
    { trait_type: 'category', value: topic['category'] },
    { trait_type: 'value', value: topic['value'] },
    { trait_type: 'duration', value: topic['duration'] },
    { trait_type: 'method', value: topic['method'] },
    { trait_type: 'valueInWei', value: timeToken['valueInWei'].toString() },
    { trait_type: 'topicOwner', value: timeToken['topicOwner'] },
    { trait_type: 'topicSlug', value: timeToken['topicSlug'] },
    { trait_type: 'arId', value: timeToken['arId'] },
    { trait_type: 'status', value: timeToken['status'] },
  ]
  const metadata: TimeTokenMetadata = {
    name: topic.name,
    description: topic.description,
    image: generateTokenImage(profile, topic, timeToken, tokenOwner),
    external_url: `https://musetime.xyz/time/${tokenId}`,
    attributes: attributes
  }
  res.status(200).json(metadata)
}

export default handler
