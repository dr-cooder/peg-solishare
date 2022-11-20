:: This works but it doesn't account for set behavior - there *will* be overlap and probably quite a bit.
:: Remembering that editing the part bins is bad because they should be of fixed length, such that there is no bit remainder
copy /b "partial\%1-*.bin" "%1.bin"