#include <stdlib.h>
#include <stdio.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>
#include <fcntl.h>

struct posiljanje
{
	int32_t meta;
	int32_t ime_zbirke_len;
	int32_t velikost;
	int32_t hash;
	char *pot;
	char *vsebina;
};

int main(int argc, char const *argv[])
{
	int fd, noviS, beri, prebrano;
	int saved_bit = 0;
	struct sockaddr_in povezava;
	int povezSize = sizeof(povezava);
	char buffer[128] = {"\0"};
	struct posiljanje podatki;

	if((fd = socket(AF_INET, SOCK_STREAM, 0)) == 0)
	{
		printf("SPODLETEL a\n");
		return -1;
	}

	povezava.sin_family = AF_INET;													//preparing socket
	povezava.sin_addr.s_addr = INADDR_ANY;
	povezava.sin_port = atoi(argv[1]);
	char str[INET_ADDRSTRLEN];
	inet_ntop(AF_INET, &(povezava.sin_addr), str, INET_ADDRSTRLEN);

	if(bind(fd, (struct sockaddr *)&povezava,sizeof(povezava)) < 0)
	{
		printf("SPODLETEL b\n");
		return -1;
	}

	if(listen(fd, 3) < 0)
	{
		printf("SPODLETEL c\n");
		return -1;
	}
	if((noviS = accept(fd, (struct sockaddr *)&povezava, (socklen_t*)&povezSize)) < 0)
	{
	printf("SPODLETELd \n");
		return -1;
	}

	beri = read(noviS, buffer, sizeof(int32_t));									//getting metadata from connection
	memcpy(&podatki.meta,buffer, beri);
	beri = read(noviS, buffer, sizeof(int32_t));
	memcpy(&podatki.ime_zbirke_len,buffer, beri);
	beri = read(noviS, buffer, sizeof(int32_t));
	memcpy(&podatki.velikost,buffer, beri);
	beri = read(noviS, buffer, sizeof(int32_t));
	memcpy(&podatki.hash,buffer, beri);

	podatki.pot = (char*) malloc(podatki.ime_zbirke_len);
	beri = read(noviS, buffer, podatki.ime_zbirke_len);
	memcpy(podatki.pot,buffer, beri);
	
	podatki.vsebina = (char*) malloc(podatki.velikost);

	do																				//getting file from connection
	{
		beri = read(noviS, buffer, 128);
		memcpy(podatki.vsebina+saved_bit, buffer,beri);
		saved_bit += beri;
	}
	while(saved_bit < podatki.velikost);


	int j = 0;
	int file;
	char dir[200] = { '\0' };

	for(int i = 0; i < podatki.ime_zbirke_len; i++)	
	{
		if(*(podatki.pot+i) == '/')
		{
			while(j<i)
			{
				j++;
			}
			mkdir(dir,0700);
			dir[i] = *(podatki.pot+i);
		}
		else if(i == podatki.ime_zbirke_len-1)
		{
			file = open(dir, O_CREAT | O_TRUNC | O_RDWR, S_IRUSR | S_IWUSR);
		}
		else
		{
			dir[i] = *(podatki.pot+i);
		}
	}

	saved_bit = 0;
	do
	{
		prebrano = write(file, podatki.vsebina+saved_bit, 128);
		saved_bit += prebrano;
	}while(prebrano > 0);


	printf("USPEL	 ");
	if(podatki.meta == 2147483648)
	{
		printf("ZBIRKA    ");
	}
	else
	{
		printf("IMENIK    ");
	}

	printf("%s    %i\n", podatki.pot, podatki.velikost);

	return 0;
}
