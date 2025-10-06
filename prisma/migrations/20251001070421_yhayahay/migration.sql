-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_kamarKosId_fkey" FOREIGN KEY ("kamarKosId") REFERENCES "KamarKos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
