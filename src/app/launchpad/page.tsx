"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Formik, Field, Form } from "formik";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggler";
import { Switch } from "@/components/ui/switch";
import * as yup from "yup";
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMint2Instruction,
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

function Launchpad() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  // const validationSchema = yup.object().shape({
  //   name: yup
  //     .string()
  //     .required("Name is required")
  //     .min(3, "Name must be at least 3 characters"),
  //   tokenSymbol: yup.string().required("Sym is required"),
  //   supply: yup
  //     .number()
  //     .required("Supply is required")
  //     .min(1, "Supply must be greater than 0"),
  //   decimals: yup
  //     .number()
  //     .required("Decimals is required")
  //     .min(1, "Decimals must be greater than 0"),
  //   image: yup.string().required("Image is required"),
  // });

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  return (
    <>
      <header className="flex justify-between items-center p-4 max-w-screen-lg mx-auto">
        <Link href="/" className="text-xl font-bold">
          TokenIt
        </Link>
        <ThemeToggle />
      </header>
      <div className="max-w-screen-lg mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="gradient-text font-bold mb-3">Launch Your Token</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create your own token in minutes. Complete the form below to get
            started.
          </p>
        </div>

        <div className="border border-border rounded-xl shadow-sm bg-card p-6 md:p-8">
          <Formik
            initialValues={{
              name: "",
              symbol: "",
              supply: "",
              decimals: "9",
              description: "",
              image: "",
              revokeFreezeAuthority: false,
              revokeMintAuthority: false,
            }}
            // validationSchema={validationSchema}
            onSubmit={async (values) => {
              if (!publicKey) return;
              try {
                const mintKeypair = Keypair.generate();
                const lamport = await getMinimumBalanceForRentExemptMint(
                  connection
                );
                const transaction = new Transaction().add(
                  SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    lamports: lamport,
                    space: MINT_SIZE,
                    programId: TOKEN_PROGRAM_ID,
                  }),
                  createInitializeMint2Instruction(
                    mintKeypair.publicKey,
                    Number(values.decimals),
                    publicKey,
                    publicKey,
                    TOKEN_PROGRAM_ID
                  )
                );

                const metadataData = {
                  name: values.name,
                  symbol: values.symbol,
                  uri: "",
                  sellerFeeBasisPoints: 0,
                  creators: null,
                  collection: null,
                  uses: null,
                };
                console.log(metadataData);

                const metadataPDAAndBump = PublicKey.findProgramAddressSync(
                  [
                    Buffer.from("metadata"),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mintKeypair.publicKey.toBuffer(),
                  ],
                  TOKEN_METADATA_PROGRAM_ID
                );

                const metadataPDA = metadataPDAAndBump[0];
                const createMetadataInstruction =
                  createCreateMetadataAccountV3Instruction(
                    {
                      metadata: metadataPDA,
                      mint: mintKeypair.publicKey,
                      mintAuthority: publicKey,
                      payer: publicKey,
                      updateAuthority: publicKey,
                    },
                    {
                      createMetadataAccountArgsV3: {
                        data: metadataData,
                        isMutable: true,
                        collectionDetails: null,
                      },
                    }
                  );

                transaction.add(createMetadataInstruction);
                const recentBlockhash = await connection.getLatestBlockhash();
                transaction.recentBlockhash = recentBlockhash.blockhash;
                // @ts-ignore
                transaction.feePayer = wallet.publicKey;

                transaction.partialSign(mintKeypair);

                console.log("Sending transaction to wallet for approval...");
                const signature = await wallet.sendTransaction(
                  transaction,
                  connection
                );
                console.log("Transaction sent, signature:", signature);

                const confirmation = await connection.confirmTransaction(
                  signature,
                  "confirmed"
                );
                console.log(
                  `Token created successfully! Mint address: ${mintKeypair.publicKey}`
                );
              } catch (error) {
                console.error("Error creating token:", error);
              }
            }}
          >
            {({ setFieldValue, values }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="space-y-6">
                  <Card className="p-6 card-hover">
                    <Label
                      htmlFor="image-upload"
                      className="text-lg font-medium mb-2 block"
                    >
                      Token Image
                    </Label>
                    <AspectRatio
                      ratio={1}
                      className="mt-3 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30"
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Token preview"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground mb-2"
                          >
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                            <path d="M12 12v9"></path>
                            <path d="m16 16-4-4-4 4"></path>
                          </svg>
                          <p className="text-muted-foreground font-medium">
                            Drag and drop or click to upload
                          </p>
                        </div>
                      )}
                    </AspectRatio>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="mt-4"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setPreviewImage(event.target?.result as string);
                            setFieldValue("image", file);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a square image for your token (recommended:
                      500x500px)
                    </p>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-lg font-medium mb-1.5 block"
                    >
                      Token Name
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Enter a memorable name"
                      className="w-full py-3"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label
                        htmlFor="symbol"
                        className="text-lg font-medium mb-1.5 block"
                      >
                        Token Symbol
                      </Label>
                      <Field
                        as={Input}
                        id="symbol"
                        name="symbol"
                        placeholder="E.g. BTC, ETH"
                        className="w-full py-3"
                      />
                    </div>

                    <div className="flex-1">
                      <Label
                        htmlFor="supply"
                        className="text-lg font-medium mb-1.5 block"
                      >
                        Initial Supply
                      </Label>
                      <Field
                        as={Input}
                        id="supply"
                        name="supply"
                        type="number"
                        placeholder="Total tokens"
                        className="w-full py-3"
                      />
                    </div>

                    <div className="w-24">
                      <Label
                        htmlFor="decimals"
                        className="text-lg font-medium mb-1.5 block"
                      >
                        Decimals
                      </Label>
                      <Field
                        as={Input}
                        id="decimals"
                        name="decimals"
                        type="number"
                        placeholder="9"
                        className="w-full py-3"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-lg font-medium mb-1.5 block"
                    >
                      Description
                    </Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      placeholder="Describe what makes your token special"
                      className="w-full min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Authority Settings</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="revokeFreezeAuthority"
                          className="cursor-pointer"
                        >
                          Revoke Freeze Authority
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Revoke Freeze allows you to create a liquidity pool
                        </p>
                      </div>
                      <Field
                        as={Switch}
                        id="revokeFreezeAuthority"
                        name="revokeFreezeAuthority"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="revokeMintAuthority"
                          className="cursor-pointer"
                        >
                          Revoke Mint Authority
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Mint Authority allows you to increase tokens supply
                        </p>
                      </div>
                      <Field
                        as={Switch}
                        id="revokeMintAuthority"
                        name="revokeMintAuthority"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 text-lg font-medium mt-4 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
                  >
                    Create Token
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
}

export default Launchpad;
