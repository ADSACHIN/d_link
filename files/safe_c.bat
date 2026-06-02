@echo off
(
echo Dim shell
echo Set shell = CreateObject^("WScript.Shell"^)
echo folderPath = shell.SpecialFolders^("Desktop"^) ^& "\test"
echo Set fso   = CreateObject^("Scripting.FileSystemObject"^)
echo Set shell = CreateObject^("WScript.Shell"^)
echo If Not fso.FolderExists^(folderPath^) Then
echo     MsgBox "ERROR: Folder not found!" ^& vbCrLf ^& folderPath, vbCritical, "Lock"
echo     WScript.Quit
echo End If
echo Set folder = fso.GetFolder^(folderPath^)
echo totalFiles = folder.Files.Count
echo If totalFiles = 0 Then
echo     MsgBox "No files found in folder!", vbExclamation, "Lock"
echo     WScript.Quit
echo End If
echo Dim lockedCount : lockedCount = 0
echo Dim failCount   : failCount   = 0
echo Dim lockedList  : lockedList  = ""
echo Dim failList    : failList    = ""
echo For Each file In folder.Files
echo     On Error Resume Next
echo     shell.Run "cmd /c icacls """ ^& file.Path ^& """ /deny Everyone:(F)", 0, True
echo     If Err.Number ^<^> 0 Then
echo         failList  = failList ^& "  X " ^& file.Name ^& vbCrLf
echo         failCount = failCount ^+ 1
echo         Err.Clear
echo     Else
echo         lockedList  = lockedList ^& "  OK " ^& file.Name ^& vbCrLf
echo         lockedCount = lockedCount ^+ 1
echo     End If
echo     On Error GoTo 0
echo Next
) > C:\example.vbs
wscript.exe "C:\example.vbs"
