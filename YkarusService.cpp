#include <iostream>
#include <Windows.h>



using namespace std;



int main()
{
    ShellExecute(NULL, "open", "ykarusdefense.exe", NULL, NULL, SW_HIDE);
    cout << "Ykarus defense exec.";
}