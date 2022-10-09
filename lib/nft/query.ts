// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from "nft.storage";
// The 'fs' builtin module on Node.js provides access to the file system
import { Blob } from "nft.storage";

// Paste your NFT.Storage API key into the quotes:
const NFT_STORAGE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDcxNjlEMThlYjlkMzYzMEZCZTQ2NGFlYjNFNjkxOTQxNzMxMDFCNDkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTMwOTQzOTY1MCwibmFtZSI6Im11c2V0aW1lTkZUIn0.ZJMGXE1oCflGQOAu3pWKRZsGiKmG3EqrmiAE82R73gg";

/**
 * Reads an image file from `imagePath` and stores an NFT with the given name and description.
 * @param {string} imagePath the path to an image file
 * @param {string} name a name for the NFT
 * @param {string} description a text description for the NFT
 */
export async function storeNFT(image: File) {
  try {
    const blob = new Blob([image]);
    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

    // call client.store, passing in the image & metadata
    const nftId = await nftstorage.storeBlob(blob);
    return nftId;
  } catch (error) {
    console.log("上传出错");
    throw error;
  }
}

// /**
//  * A helper to read a file from a location on disk and return a File object.
//  * Note that this reads the entire file into memory and should not be used for
//  * very large files.
//  * @param {string} filePath the path to a file to store
//  * @returns {File} a File object containing the file content
//  */
// async function fileFromPath(filePath:string) {
//   const content = await fs.promises.readFile(filePath);
//   const type = mime.getType(filePath);
//   return new File([content], path.basename(filePath), { type });
// }

// /**
//  * The main entry point for the script that checks the command line arguments and
//  * calls storeNFT.
//  *
//  * To simplify the example, we don't do any fancy command line parsing. Just three
//  * positional arguments for imagePath, name, and description
//  */
// async function main() {
//   const args = process.argv.slice(2);
//   if (args.length !== 3) {
//     console.error(
//       `usage: ${process.argv[0]} ${process.argv[1]} <image-path> <name> <description>`
//     );
//     process.exit(1);
//   }

//   const [imagePath, name, description] = args;
//   const result = await storeNFT(imagePath, name, description);
//   console.log(result);
// }

// // Don't forget to actually call the main function!
// // We can't `await` things at the top level, so this adds
// // a .catch() to grab any errors and print them to the console.
// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
